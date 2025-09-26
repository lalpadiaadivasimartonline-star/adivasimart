//Core Modules
const path = require("path");
//External Modules
const express = require("express");

//Local Modules
const guestControllers = require("../controllers/guestControllers");
const GuestUsers = require("../models/GuestUsers");

const guestRouter = express.Router();

const ensureGuestSession = async (req, res, next) => {
  // console.log("======", req.query);
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

guestRouter.post(
  "/guest/cart",
  ensureGuestSession,
  guestControllers.guestSession
);
guestRouter.get("/guest/cart/items", guestControllers.getGuestCartItems);
guestRouter.delete(
  "/guest/cart/delete/items",
  ensureGuestSession,
  guestControllers.removeGuestCartItem
);
guestRouter.put(
  "/guest/cart/update",
  ensureGuestSession,
  guestControllers.updateGuestCart
);
// guestRouter.post('/guest/cart', ensureGuestSession, guestControllers.guestSession);
// guestRouter.get('/guest/cart/:guestId', guestControllers.getGuestCartItems);

module.exports = guestRouter;
