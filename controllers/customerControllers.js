const Cart = require("../models/Cart");
const GuestUsers = require("../models/GuestUsers");
const Products = require("../models/Products");

exports.postCustomerCartItems = async (req, res, next) => {
  const { productId, quantity, customerId } = req.body;
  const size = req.body.size || null;
  const color = req.body.color || null;
  // const { guestId } = req;
  // console.log("====BACKEND CUSTOMER_ID===", customerId);
  // console.log("====Product id===", productId);
  // console.log("=======QQQQQQQQQQUANTITY=====", quantity);
  // console.log("======SSSSSSSSIIIIIIIZZZZZZZZZEEEEEEE", size);
  // console.log("==================CCCCCCCOLLLLOOOOOR", color);

  try {
    const [row] = await Cart.getCartItemByCustomerId(customerId, productId);
    // console.log("RRRRRRRRRRROOOOOOOOOOOWWWWWW========", row);
    // let existing = row.some((item) => item.product_id ==)

    if (row.length > 0) {
      for (let i = 0; i < row.length; i++) {
        if (row[i].product_id === productId) {
          quantity += row[i].quantity;
          await Cart.update(customerId, productId, quantity, size, color);
        }
      }
    } else {
      const cart = new Cart(null,customerId, productId, quantity, size);
      cart.save();
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to save cart" });
  }

  const [cartItems] = customerId && await Cart.getCustomerCartItems(customerId);

  res.json({ cartItems });
};


exports.getProducts = async (req, res, next) => {
  const products = await Products.fetchAll();
  // console.log("========GETPRODUCT====", req.session);
  // console.log(products)
  res.send({ products: products });
};

exports.getProductById = async (req, res, next) => {
  const product_id  = req.params.product_id;
  // console.log("PRODUCTID", product_id, typeof product_id);
  const product = await Products.findById(Number(product_id));
  // console.log("PRODUCT", product);
  res.json(product[0][0]);
};

exports.getCustomerCartItems = async (req, res, next) => {
  const { customerId } = req.query;
  // console.log("======GET CUSTOMER CART ITEM======", customerId);

  try {
    const [rows] = await Cart.getCustomerCartItems(customerId);
    console.log("=====GUEST CART=====", rows);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to load cart" });
  }
};

exports.updateCustomerCart = async (req, res, next) => {
  const { productId, quantity,customerId } = req.body;
  const size = req.body.size || null;
  const color = req.body.color || null;
  // const { customerId } = req;
  // console.log("=====PRODUCT ID====", productId);
  // console.log("====QUANTITY======", quantity);
  // console.log("====SIZE======", size);
  // console.log("====COLOR======", color);
  try {
    const cart = new Cart(null, customerId, productId, quantity, size, color);
    await cart.update();
  } catch (error) {
    console.log("failed to update", error);
  }
  const [cartItems] = await Cart.getCustomerCartItems(customerId);

  res.json({ cartItems });
};


exports.removeCustomerCartItem = async (req, res, next) => {
  const { productId, customerId } = req.query;
  // console.log("PRODUCTTTTT IIIIIIDDD=====>", productId);
  // console.log("====BACKEND GUEST_ID===", customerId);
  // console.log("====cartItems===", cartItems);

  try {
    await Cart.remove(customerId, productId);

  } catch (error) {
    console.log("FAILED TO SAVE CART:===>",error)
    res.status(500).json({ error: "Failed to save cart" });
  }
  const [cartItems] = await Cart.getCustomerCartItems(customerId);
  // console.log("CAAAAAAAAAAAAAAAAAAAAAAAAAART======>", cartItems);

  res.json({ cartItems });

};