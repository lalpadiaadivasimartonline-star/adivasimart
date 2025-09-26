//Core Modules
const path = require("path");
//External Modules
const express = require("express");

const productControllers = require('../controllers/productControllers');
const productRouter = express.Router();

productRouter.get('/popular', productControllers.getPopularProducts);


module.exports = productRouter;