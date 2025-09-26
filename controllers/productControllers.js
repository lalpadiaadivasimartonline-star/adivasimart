const path = require("path");
const fs = require("fs");
//Local Modules
const db = require("../utils/dataBaseUtils");
const Products = require("../models/Products");
const rootDir = require("../utils/pathUtils");
const Users = require("../models/Users");
const Cart = require("../models/Cart");
const GuestUsers = require("../models/GuestUsers");

exports.getPopularProducts = async (req, res, next) => {
  try {
    const [productIdCustomer] = await db.execute(
      `SELECT product_id FROM customers_cart_items`
    );
    const [productIdGuest] = await db.execute(
      `SELECT product_id FROM guest_cart_items`
    );
    const [productIdCart] = await db.execute(`SELECT product_id FROM order_items`);

    let productId = [
      ...productIdCustomer.map((id) => id.product_id),
      ...productIdGuest.map((id) => id.product_id),
      ...productIdCart.map((id) => id.product_id),
    ];
    productId = [...new Set(productId)];
    
      const [popular] = await db.execute(
        `SELECT * FROM products WHERE product_id IN (${productId
          .map(() => "?")
          .join(", ")})`,
        productId.flat()
      );
    //   console.log(popular)

    // console.log("PRODUCT ID FROM CUSTOMER CART", productIdCustomer);
    // console.log("PRODUCT ID FROM GUEST CART", productIdGuest);

    if (!productIdCustomer || !productIdGuest) {
      console.log("NOT FOUND");
      return res.json({ error: "NOT FOUND" });
    }
    res.json({
        popular,
    });
  } catch (error) {
    console.log("FAILED TO GET PRDUCT ID : ", error);
  }
};
// ${productId.map(()=> '?').join(', ')}
// 