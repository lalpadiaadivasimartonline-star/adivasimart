const db = require("../utils/dataBaseUtils");

module.exports = class OrderItem {
  constructor(
    orderId,
    productId,
    quantity,
    unitPrice,
    totalPrice,
    size = null,
    color = null,
    productName,
    productImage
  ) {
    this.orderId = orderId;
    this.productId = productId;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.totalPrice = totalPrice;
    this.size = size;
    this.color = color;
    this.productName = productName;
    this.productImage = productImage;
  }

  async save() {
    try {
      const result = await db.execute(
        `INSERT INTO order_items (
          order_id, product_id, quantity, unit_price, total_price, 
          size, color, product_name, product_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.orderId,
          this.productId,
          this.quantity,
          this.unitPrice,
          this.totalPrice,
          this.size,
          this.color,
          this.productName,
          this.productImage,
        ]
      );
      return result;
    } catch (error) {
      console.error("Error saving order item:", error);
      throw error;
    }
  }

  static async saveMultiple(orderItems) {
    try {
      const values = orderItems.map((item) => [
        item.orderId,
        item.productId,
        item.quantity,
        item.unitPrice,
        item.totalPrice,
        item.size,
        item.color,
        item.productName,
        item.productImage,
      ]);

      const placeholders = orderItems
        .map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .join(", ");
      const flatValues = values.flat();

      const result = await db.execute(
        `INSERT INTO order_items (
          order_id, product_id, quantity, unit_price, total_price, 
          size, color, product_name, product_image
        ) VALUES ${placeholders}`,
        flatValues
      );
      return result;
    } catch (error) {
      console.error("Error saving multiple order items:", error);
      throw error;
    }
  }

  static async findByOrderId(orderId) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM order_items WHERE order_id = ?",
        [orderId]
      );
      return rows;
    } catch (error) {
      console.error("Error finding order items:", error);
      throw error;
    }
  }
};
