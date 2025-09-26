const db = require("../utils/dataBaseUtils");

module.exports = class Payment {
  constructor(
    paymentId,
    orderId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    amount,
    currency = "INR",
    status = "pending",
    paymentMethod = null,
    failureReason = null
  ) {
    this.paymentId = paymentId;
    this.orderId = orderId;
    this.razorpayOrderId = razorpayOrderId;
    this.razorpayPaymentId = razorpayPaymentId;
    this.razorpaySignature = razorpaySignature;
    this.amount = amount;
    this.currency = currency;
    this.status = status;
    this.paymentMethod = paymentMethod;
    this.failureReason = failureReason;
  }

  async save() {
    try {
      const result = await db.execute(
        `INSERT INTO payments (
          payment_id, order_id, razorpay_order_id, razorpay_payment_id, 
          razorpay_signature, amount, currency, status, payment_method, failure_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.paymentId,
          this.orderId,
          this.razorpayOrderId,
          this.razorpayPaymentId,
          this.razorpaySignature,
          this.amount,
          this.currency,
          this.status,
          this.paymentMethod,
          this.failureReason,
        ]
      );
      return result;
    } catch (error) {
      console.error("Error saving payment:", error);
      throw error;
    }
  }

  static async findById(paymentId) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM payments WHERE payment_id = ?",
        [paymentId]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding payment:", error);
      throw error;
    }
  }

  static async findByOrderId(orderId) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM payments WHERE order_id = ?",
        [orderId]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding payment by order:", error);
      throw error;
    }
  }

  static async updateStatus(paymentId, status, failureReason = null) {
    try {
      const result = await db.execute(
        "UPDATE payments SET status = ?, failure_reason = ? WHERE payment_id = ?",
        [status, failureReason, paymentId]
      );
      return result;
    } catch (error) {
      console.error("Error updating payment status:", error);
      throw error;
    }
  }
};
