// const Razorpay = require('../utils/razorPayConfig')
delete require.cache[require.resolve("../utils/razorPayConfig")];
const razorpay = require("../utils/razorPayConfig");
const crypto = require("crypto");

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_fr3PztTWEgJXUs',
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

exports.postCreateOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    
    //Converting amount in paise (for razorpay);
    const orderAmount = Math.round(amount * 100);

    const options = {
      amount: orderAmount,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, //Auto capture payment
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order: order,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {





  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    // console.log("=== PAYMENT VERIFICATION DEBUG ===");
    // console.log("Razorpay Order ID:", razorpay_order_id);
    // console.log("Razorpay Payment ID:", razorpay_payment_id);
    // console.log("Razorpay Signature:", razorpay_signature);
    // console.log(
    //   "Secret Key (first 8 chars):",
    //   process.env.RAZORPAY_KEY_SECRET?.substring(0, 8)
    // );

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    // DEBUG: Log signature comparison
    // console.log("Sign string:", sign);
    // console.log("Expected signature:", expectedSign);
    // console.log("Received signature:", razorpay_signature);
    // console.log("Signatures match:", razorpay_signature === expectedSign);
    // console.log("=== END DEBUG ===");

    if (razorpay_signature === expectedSign) {
      // Payment verified - Update order status in database
      // Send confirmation email
      // Clear cart

      const Order = require("../models/Orders");
      const OrderItem = require("../models/OrderItems");
      const Cart = require("../models/Cart");

      const orderId = `ORD_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

      const order = new Order(
        orderId,
        orderDetails.customerId,
        orderDetails.guestId,
        "confirmed",
        "paid",
        "online",
        orderDetails.totalAmount,
        orderDetails.originalAmount,
        orderDetails.discount,
        0, // delivery charge
        orderDetails.shippingAddress,
        orderDetails.billingAddress,
        "Online payment via Razorpay"
      );

      await order.save();

      const orderItems = orderDetails.items.map((item) => {
        return new OrderItem(
          orderId,
          item.product.product_id,
          item.quantity,
          item.product.sale_price,
          item.quantity * item.product.sale_price,
          item.size,
          item.color,
          item.product.product_name,
          item.product.product_image
        );
      });

      await OrderItem.saveMultiple(orderItems);

      const Payment = require("../models/Payment");
      const payment = new Payment(
        razorpay_payment_id,
        orderId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderDetails.totalAmount,
        "INR",
        "success"
      );
      await payment.save();

      if (orderDetails.customerId || orderDetails.guestId) {
        // Clear customer cart items
        for (const item of orderDetails.items) {
          await Cart.remove(orderDetails.customerId, item.product.product_id);
        }

        const emailService = require("../utils/emailServices");
        try {
          const customerEmail =
            orderDetails.shippingAddress.eamil ||
            (orderDetails.customerId
              ? "customer@example.com"
              : "guest@example.com");

          const orderItemsWithDetails = orderDetails.items.map((item) => ({
            product_name: item.product.product_name,
            product_image: item.product.product_image,
            quantity: item.quantity,
            unit_price: item.product.sale_price,
            total_price: item.quantity * item.product.sale_price,
          }));

          await emailService.sendOrderConfirmation(
            order,
            customerEmail,
            orderItemsWithDetails
          );

          await emailService.sendPaymentConfirmation(order, customerEmail, {
            razorpayPaymentId: razorpay_payment_id,
            amount: orderDetails.totalAmount,
          });
        } catch (error) {
          console.error("Email sending failed (non-critical):", error);
        }

        res.status(200).json({
          success: true,
          message: "Payment verified and order created successfully",
          payment_id: razorpay_payment_id,
          order_id: orderId,
          razorpay_order_id: razorpay_order_id,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid payment signature",
        });
      }
      // TODO: Save order to database
      // TODO: Clear user cart
      // TODO: Send confirmation email
    }
  } catch (error) {
      console.error("Payment verification failed:", error);
      res
        .status(500)
        .json({
          success: false,
          error: error.message,
          message: "Invalid payment signature",
        });
  }
};



// Get Payment Details
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await razorpay.payments.fetch(paymentId);
    
    res.status(200).json({
      success: true,
      payment: payment
    });
  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment details',
      details: error.message
    });
  }
};

// Refund Payment (optional)
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    
    const refundAmount = amount ? Math.round(amount * 100) : undefined;
    
    const refund = await razorpay.payments.refund(paymentId, {
      amount: refundAmount, // If not provided, full refund
      reason: reason || 'requested_by_customer'
    });
    
    res.status(200).json({
      success: true,
      refund: refund
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process refund',
      details: error.message
    });
  }
};


exports.razorpayWebHook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['X-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");
    
  if (signature === expectedSignature) {
    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    // Handle different events
    switch (event) {
      case "payment.captured":
        // Update order status to paid
        break;
      case "payment.failed":
        // Update order status to failed
        break;
      case "refund.created":
        // Handle refund
        break;
    }

    res.status(200).json({ status: "ok" });
  } else {
    res.status(400).json({ error: "Invalid signature" });
  }
};


exports.createCODOrder = async (req, res) => {
  try {
    const { orderDetails } = req.body;

    const Order = require("../models/Orders");
    const OrderItem = require("../models/OrderItems");
    const Cart = require("../models/Cart");

    // Generate unique order ID
    const orderId = `COD_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Create order
    const order = new Order(
      orderId,
      orderDetails.customerId,
      orderDetails.guestId,
      "pending",
      "pending",
      "cod",
      orderDetails.totalAmount,
      orderDetails.originalAmount,
      orderDetails.discount,
      0, // delivery charge
      orderDetails.shippingAddress,
      orderDetails.billingAddress,
      "Cash on Delivery order"
    );

    await order.save();

    // Create order items
    const orderItems = orderDetails.items.map((item) => {
      return new OrderItem(
        orderId,
        item.product.product_id,
        item.quantity,
        item.product.sale_price,
        item.quantity * item.product.sale_price,
        item.size,
        item.color,
        item.product.product_name,
        item.product.product_image
      );
    });

    await OrderItem.saveMultiple(orderItems);

    // Clear user cart
    if (orderDetails.customerId) {
      // Clear customer cart items
      for (const item of orderDetails.items) {
        await Cart.remove(orderDetails.customerId, item.product.product_id);
      }
    }

      const emailService = require("../utils/emailServices");
      try {
        const customerEmail =
          orderDetails.shippingAddress.email || "guest@example.com";

        const orderItemsWithDetails = orderDetails.items.map((item) => ({
          product_name: item.product.product_name,
          product_image: item.product.product_image,
          quantity: item.quantity,
          unit_price: item.product.sale_price,
          total_price: item.quantity * item.product.sale_price,
        }));

        await emailService.sendOrderConfirmation(
          order,
          customerEmail,
          orderItemsWithDetails
        );
      } catch (emailError) {
        console.error("Email sending failed (non-critical):", emailError);
      }



    res.status(200).json({
      success: true,
      message: "COD order created successfully",
      order_id: orderId,
    });
  } catch (error) {
    console.error("Error creating COD order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create COD order",
      details: error.message,
    });
  }
};

const verifyPaymentWithAPI = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment.status === "captured";
  } catch (error) {
    console.error("Payment API verification failed:", error);
    return false;
  }
};