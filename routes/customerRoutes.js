//Core Modules
const path = require("path");
//External Modules
const express = require("express");

//Local Modules
const customerControllers = require("../controllers/customerControllers");
const GuestUsers = require("../models/GuestUsers");

const customerRouter = express.Router();

const ensureGuestSession = async (req, res, next) => {
  // console.log("======",req.query)
  let { guestId } = req.body || req.query;
  if (!guestId) guestId = req.query;
  // console.log("====GUESTID====", guestId);

  if (!guestId) {
    return res.status(400).json({ error: "Guest ID required" });
  }

  try {
    // Create guest session if it doesn't exist (30 days expiry)
    let guest_id = guestId;
    const guestUsers = new GuestUsers(guest_id);
    guestUsers.saveGuestId();
    req.guestId = guestId;
    next();
  } catch (error) {
    console.log("====ERROR====", error);
    res.status(500).json({ error: "Database error" });
  }
};

customerRouter.get("/products", customerControllers.getProducts);
customerRouter.get('/product/:product_id', customerControllers.getProductById);
customerRouter.get('/customer/cart/items', customerControllers.getCustomerCartItems);
customerRouter.post('/customer/cart', customerControllers.postCustomerCartItems);
customerRouter.put("/customer/cart/update", customerControllers.updateCustomerCart);
customerRouter.delete("/customer/cart/delete/items", customerControllers.removeCustomerCartItem);

module.exports = customerRouter;
