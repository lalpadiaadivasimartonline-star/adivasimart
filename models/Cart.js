//Core Module
const path = require("path");
//Local Modules
const db = require("../utils/dataBaseUtils");

module.exports = class Cart {
  constructor(cartId, customerId, productId, quantity, size, color) {
    this.cartId = cartId || null;
    this.customerId = customerId;
    this.productId = productId;
    this.quantity = quantity;
    this.size = size || null;
    this.color = color || null;
  }

  save() {
    db.execute(
      `INSERT INTO customers_cart_items (customer_cart_id, customer_id, product_id, quantity, size, color) VALUES (?,?,?,?,?,?)`,
      [
        this.cartId,
        this.customerId,
        this.productId,
        this.quantity,
        this.size,
        this.color,
      ]
    );
  }
  update() {
    // console.log("UPDATE", this.customerId, this.productId,  this.quantity);
    db.execute(
      `UPDATE customers_cart_items SET quantity= ?, size=?, color= ? WHERE customer_id = ? AND product_id =?`,
      [this.quantity, this.size, this.color, this.customerId, this.productId]
    );
  }
  static getAllCartItems() {
    db.execute(`SELECT * FROM customers_cart_items`);
  }
  static getCustomerCartItems(id) {
    return db.execute(
      `SELECT * FROM customers_cart_items WHERE customer_id = ?`,
      [id]
    );
  }

  static getCustomerFavourite(id) {
    return db.execute(
      `SELECT * FROM customers_favourites WHERE customer_id = ?`,
      [id]
    );
  }
  static getCartItemByCustomerId(guestId, productId) {
    return db.execute(
      `SELECT * FROM customers_cart_items WHERE customer_id = ? AND product_id = ?`,
      [guestId, productId]
    );
    }
    
    static remove(customerId, productId) {
        return db.execute(`DELETE FROM customers_cart_items WHERE customer_id = ? AND product_id = ?`, [customerId, productId]);
    }
};
