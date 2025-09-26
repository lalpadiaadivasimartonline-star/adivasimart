const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
//   host: "smpt.www.google.com",
//   port: 587,
//   secure: false,
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Email transporter verification failed : ", error);
  } else {
    console.log("Email service is ready");
  }
});

const sendOrderConfirmation = async (order, customerEmail, orderItems) => {
  try {
    const mailOptions = {
      from: {
        name: "Lalapadia Adivasi Mart",
        address: process.env.EMAIL_USER,
      },
      to: customerEmail,
      subject: `Order Comfirmation - ${order.orderId}`,
      html: generateOrderConfirmationHTML(order, orderItems),
      text: generateOrderConfirmationText(order, orderItems),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent : ", result.messageId);
    return result;
  } catch (error) {
    console.log("Error sending order confirmation email : ", error);
    throw error;
  }
};

const sendPaymentConfirmation = async (
  order,
  customerEmail,
  paymentDetails
) => {
  try {
    const mailOptions = {
      from: {
        name: "Lalpadia Adivasi Mart",
        address: process.env.EMAIL_USER,
      },
      to: customerEmail,
      subject: `Payment confirmed - ${order.orderId}`,
      html: generatePaymentConfirmationHTML(order, paymentDetails),
      text: generatePaymentConfirmationTExt(order, paymentDetails),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Payment confirmation email sent: ", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending payment confirmation email : ", error);
    throw error;
  }
};

const sendOrderStatusUpdate = async (order, customerEmail, newStatus) => {
  try {
    const mailOptions = {
      from: {
        name: "Lalpadia Adivasi Mart",
        address: process.env.EMAIL_USER,
      },
      to: customerEmail,
      subject: `Order Update - ${order.orderId}`,
      html: generateStatusUpdateHTML(order, newStatus),
      text: generateStatusUpdateText(order, newStatus),
      };
      
      const result = await transporter.sendMail(mailOptions);
      console.log("Order status update email sent:", result.messageId);
      return result;
  } catch (error) {
      console.error("Error sending order status update email:", error);
      throw error;
  }
};










//  Generate HTML email template for order confirmation
const generateOrderConfirmationHTML = (order, orderItems) => {
  const itemsHTML = orderItems.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${process.env.BASE_URL}${item.product_image}" alt="${item.product_name}" style="width: 50px; height: 50px; object-fit: cover;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.unit_price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.total_price}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .order-details { background-color: #fff; border: 1px solid #ddd; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            .total { font-weight: bold; background-color: #f8f9fa; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmation</h1>
                <p>Thank you for your order!</p>
            </div>
            
            <div class="order-details">
                <h2>Order Details</h2>
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Order Date:</strong> ${new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
                
                <h3>Items Ordered</h3>
                <table>
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 10px; text-align: left;">Image</th>
                            <th style="padding: 10px; text-align: left;">Product</th>
                            <th style="padding: 10px; text-align: left;">Quantity</th>
                            <th style="padding: 10px; text-align: left;">Price</th>
                            <th style="padding: 10px; text-align: left;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        <tr class="total">
                            <td colspan="4" style="padding: 10px; text-align: right;">Total Amount:</td>
                            <td style="padding: 10px;">₹${order.totalAmount}</td>
                        </tr>
                    </tbody>
                </table>
                
                <h3>Shipping Address</h3>
                <p>
                    ${JSON.parse(order.shippingAddress).name}<br>
                    ${JSON.parse(order.shippingAddress).address}<br>
                    ${JSON.parse(order.shippingAddress).city}, ${JSON.parse(order.shippingAddress).state} - ${JSON.parse(order.shippingAddress).pincode}<br>
                    Phone: ${JSON.parse(order.shippingAddress).phone}
                </p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; color: #666;">
                <p>If you have any questions, please contact us at support@yourstore.com</p>
                <p>Thank you for shopping with us!</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Generate plain text version
const generateOrderConfirmationText = (order, orderItems) => {
  const itemsText = orderItems.map(item => 
    `${item.product_name} - Qty: ${item.quantity} - Price: ₹${item.unit_price} - Total: ₹${item.total_price}`
  ).join('\n');

  const shippingAddress = JSON.parse(order.shippingAddress);
  
  return `
Order Confirmation

Thank you for your order!

Order Details:
- Order ID: ${order.orderId}
- Order Date: ${new Date(order.created_at || Date.now()).toLocaleDateString()}
- Payment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
- Payment Status: ${order.paymentStatus}

Items Ordered:
${itemsText}

Total Amount: ₹${order.totalAmount}

Shipping Address:
${shippingAddress.name}
${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}
Phone: ${shippingAddress.phone}

If you have any questions, please contact us at support@yourstore.com
Thank you for shopping with us!
  `;
};

// Generate HTML for payment confirmation
const generatePaymentConfirmationHTML = (order, paymentDetails) => {
  return `
    <!-- Similar to order confirmation but focused on payment details -->
    <h1>Payment Confirmed</h1>
    <p>Your payment for order ${order.orderId} has been successfully processed.</p>
    <p><strong>Payment ID:</strong> ${paymentDetails.razorpayPaymentId}</p>
    <p><strong>Amount Paid:</strong> ₹${paymentDetails.amount}</p>
  `;
};

// Generate text for payment confirmation
const generatePaymentConfirmationText = (order, paymentDetails) => {
  return `
Payment Confirmed

Your payment for order ${order.orderId} has been successfully processed.
Payment ID: ${paymentDetails.razorpayPaymentId}
Amount Paid: ₹${paymentDetails.amount}
  `;
};

// Generate status update templates
const generateStatusUpdateHTML = (order, newStatus) => {
  return `
    <h1>Order Status Update</h1>
    <p>Your order ${order.orderId} status has been updated to: <strong>${newStatus}</strong></p>
  `;
};

const generateStatusUpdateText = (order, newStatus) => {
  return `Order Status Update: Your order ${order.orderId} status has been updated to: ${newStatus}`;
};

module.exports = {
  sendOrderConfirmation,
  sendPaymentConfirmation,
  sendOrderStatusUpdate,
};
