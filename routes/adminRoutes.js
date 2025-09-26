//Core Modules
const path = require("path");
//External Modules
const express = require("express");

//Local Modules
const adminControllers = require("../controllers/adminControllers");

const adminRouter = express.Router();

function requireAuth(req, res, next) {
  // console.log("AUTH ROUTES", req.get("origin"));
  if(!req.get('origin')) return res.json('not permitted')
  if (req.session) {
    return next();
  }

  return res
    .status(401)
    .json({
      error: "Unauthorized Access",
      userId: req.session.userId,
      session: req.session,
    });
}

adminRouter.post('/', adminControllers.postAddProduct);
adminRouter.get('/products',requireAuth, adminControllers.getProducts);
adminRouter.get('/product/:product_id',requireAuth, adminControllers.getProductById);
adminRouter.get('/products/user/:userId', adminControllers.getProductsByUser)
adminRouter.get('/user_data/:user_id', adminControllers.getUserData);
adminRouter.delete('/product/:product_id',requireAuth, adminControllers.deleteProduct);
adminRouter.put('/product/edit/:product_id', adminControllers.editProduct);


module.exports = adminRouter;