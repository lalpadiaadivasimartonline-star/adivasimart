//Core Module
const path = require("path");
//Local Modules
const db = require("../utils/dataBaseUtils");

module.exports = class Customers {
  constructor(
    customer_id,
    first_name,
    last_name,
    user_name,
    phone_number,
    email,
    password,
    session_data
  ) {

    this.customer_id = customer_id || null;
    this.first_name = first_name || "";
    this.last_name = last_name || "";
    this.user_name = user_name || "";
    this.phone_number = phone_number || "";
    this.email = email || "";
    this.password = password || "";
    this.session_data = session_data || [];
  }

  save() {
    db.execute(
      `INSERT INTO customers (
        customer_id,first_name,last_name,user_name,phone_number,email,password,session_data
        ) VALUES (?,?,?,?,?,?,?,?)`,
      [
        this.customer_id,
        this.first_name,
        this.last_name,
        this.user_name,
        Number(this.phone_number),
        this.email,
        this.password,
        JSON.stringify(this.session_data),
      ]
    );
  }
  update() {
    db.execute(
      `UPDATE customers SET first_name=?,last_name=?,user_name=?,phone_number=?,email=?,password=?, session_data=? WHERE customer_id = ?`,
      [
        this.first_name,
        this.last_name,
        this.user_name,
        Number(this.phone_number),
        this.email,
        this.password,
        JSON.stringify(this.session_data),
        this.customer_id,
      ]
    );
  }
   static async getCustomer(phoneNumber, email) {
    return await db.execute(`SELECT customer_id, password, user_name, first_name, last_name,user_name, phone_number, email FROM customers WHERE phone_number = ? OR email = ? `, [phoneNumber, email]);
  }

};
