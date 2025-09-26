const db = require("../utils/dataBaseUtils");

module.exports = class Order {
  constructor(
    orderId,
    customerId,
    guestId,
    orderStatus = "pending",
    paymentStatus = "pending",
    paymentMethod,
    totalAmount,
    originalAmount,
    discountAmount = 0,
    deliveryCharge = 0,
    shippingAddress,
    billingAddress,
    orderNotes = null
  ) {
    this.orderId = orderId;
    this.customerId = customerId;
    this.guestId = guestId;
    this.orderStatus = orderStatus;
    this.paymentStatus = paymentStatus;
    this.paymentMethod = paymentMethod;
    this.totalAmount = totalAmount;
    this.originalAmount = originalAmount;
    this.discountAmount = discountAmount;
    this.deliveryCharge = deliveryCharge;
    this.shippingAddress = shippingAddress;
    this.billingAddress = billingAddress;
    this.orderNotes = orderNotes;
  }

  async save() {
    try {
      const result = await db.execute(
        `INSERT INTO orders (
          order_id, customer_id, guest_id, order_status, payment_status, 
          payment_method, total_amount, original_amount, discount_amount, 
          delivery_charge, shipping_address, billing_address, order_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.orderId,
          this.customerId,
          this.guestId,
          this.orderStatus,
          this.paymentStatus,
          this.paymentMethod,
          this.totalAmount,
          this.originalAmount,
          this.discountAmount,
          this.deliveryCharge,
          JSON.stringify(this.shippingAddress),
          JSON.stringify(this.billingAddress),
          this.orderNotes,
        ]
      );
      return result;
    } catch (error) {
      console.error("Error saving order:", error);
      throw error;
    }
  }

  static async findById(orderId) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM orders WHERE order_id = ?",
        [orderId]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding order:", error);
      throw error;
    }
  }

  static async findByCustomerId(customerId) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC",
        [customerId]
      );
      return rows;
    } catch (error) {
      console.error("Error finding orders by customer:", error);
      throw error;
    }
  }

  static async updateStatus(orderId, orderStatus, paymentStatus = null) {
    try {
      let query = "UPDATE orders SET order_status = ?";
      let params = [orderStatus];

      if (paymentStatus) {
        query += ", payment_status = ?";
        params.push(paymentStatus);
      }

      query += " WHERE order_id = ?";
      params.push(orderId);

      const result = await db.execute(query, params);
      return result;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }
};
