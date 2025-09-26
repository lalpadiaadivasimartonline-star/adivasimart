const GuestUsers = require("../models/GuestUsers");

exports.guestSession = async (req, res, next) => {
  const { product_id } = req.body;
  const { quantity } = req.body;
  const size = req.body.size || null;
  const color = req.body.color || null;
  const { guestId } = req;
  

  try {
    const [row] = await GuestUsers.findCartItemsByGuestId(guestId, product_id);
    

    if (row.length > 0) {
      for (let i = 0; i < row.length; i++) {
        if (row[i].product_id === product_id) {
          quantity += row[i].quantity;
          await GuestUsers.update(guestId, product_id, quantity, size, color);
        }
      }
    } else {
      const guestUsers = new GuestUsers(guestId, product_id, quantity, size);
      guestUsers.save();
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to save cart" });
  }

  const [cartItems] = await GuestUsers.findGuestCartItem(guestId);

  res.json({ cartItems });
};

exports.removeGuestCartItem = async (req, res, next) => {
  const { product_id } = req.query;
  const { guestId } = req;

  try {
    await GuestUsers.remove(guestId, product_id);
  } catch (error) {
    res.status(500).json({ error: "Failed to save cart" });
  }
  const [cartItems] = await GuestUsers.findGuestCartItem(guestId);
  res.json({ cartItems });
};

exports.getGuestCartItems = async (req, res, next) => {
  const { guest_id } = req.query;
 

  try {
    const [rows] = await GuestUsers.findGuestCartItem(guest_id);
    

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to load cart" });
  }
};

exports.updateGuestCart = async (req, res, next) => {
  const { product_id, quantity } = req.body;
  const size = req.body.size || null;
  const color = req.body.color || null;
  const { guestId } = req;
  try {
    await GuestUsers.update(guestId, product_id, quantity, size, color);
  } catch (error) {
    console.log("failed to update", error);
  }
  const [cartItems] = await GuestUsers.findGuestCartItem(guestId);

  res.json({ cartItems });
};
