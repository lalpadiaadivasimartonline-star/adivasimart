//Core Modules
const path = require("path");
//External Modules
const express = require("express");

//Local Modules
const customerAuthControllers = require("../controllers/customerAuthControllers");

const customerAuthRouter = express.Router();

customerAuthRouter.post(
  "/auth/customer/signup",
  customerAuthControllers.postCustomerSignup
);

customerAuthRouter.post('/auth/customer/login', customerAuthControllers.postCustomerLogin);
customerAuthRouter.post('/auth/customer/check', customerAuthControllers.checkLoginStatus);
customerAuthRouter.post('/auth/customer/logout', customerAuthControllers.postLogout);

module.exports = customerAuthRouter;
