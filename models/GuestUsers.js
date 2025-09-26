//Core Module
const path = require("path");
//Local Modules
const db = require("../utils/dataBaseUtils");

module.exports = class GuestUsers {
  constructor(guest_id, product_id, quantity,size,color) {
    this.guest_id = guest_id;
    this.product_id = product_id;
    this.quantity = quantity;
    this.size = size || null;
    this.color = color || null;
  }

  save() {
    // return db.execute(
    //   `INSERT INTO guest_cart_items (guest_id, product_id, quantity) VALUES (${this.value
    //     .map(() => "?")
    //     .join(", ")})`,
    //   this.value.flat()
    // );

    return db.execute(
      `INSERT INTO guest_cart_items (guest_id, product_id, quantity, size, color) VALUES (?,?,?,?,?)`,
      [this.guest_id, this.product_id, this.quantity, this.size, this.color]
    );
  }

  saveGuestId() {
    // db.execute(`INSERT_INTO guest_sessions (guest_id, created_at, updated_at, expires_at) VALUES (?,?,?,?)`, [this.guest_id, this.created_at, this.updated_at, this.expires_at]);

    return db.execute(
      `INSERT INTO guest_sessions (guest_id, expires_at) 
       VALUES (?, DATE_ADD(NOW(), INTERVAL 30 DAY))
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [this.guest_id]
    );
  }
  static update(guestId, product_id, quantity,size,color) {
    return db.execute(
      `UPDATE guest_cart_items SET quantity = ?, size=?, color=?  WHERE guest_id = ? AND product_id = ?`,
      [quantity,size||null,color||null, guestId, product_id]
    );
  }

  static remove(guestId, productId) {
    return db.execute(
      "DELETE FROM guest_cart_items WHERE product_id = ? AND guest_id = ?",
      [productId, guestId]
    );
  }
  static findGuestById(guestId) {
    return db.execute(`SELECT * FROM guest_sessions WHERE guest_id = ?`, [
      guestId,
    ]);
  }
  static findGuestCartItem(guestId) {
  return db.execute(
    `SELECT * FROM guest_cart_items WHERE guest_id = ?`,
    [guestId]
  );
}
  static findCartItemsByGuestId(guestId,product_id) {
    return db.execute(`SELECT * FROM guest_cart_items WHERE guest_id = ? AND product_id = ?`, [
      guestId, product_id
    ]);
  }
};
