//Core Modules
const path = require("path");
//External Modules
const express = require("express");

//Local Modules
const authControllers = require("../controllers/authController");

const authRouter = express.Router();



function requireAuth(req, res, next) {
  console.log("AUTH ROUTES", req.session.userId);
  if (req.session.userId && req.session) {
    return next();
  }

  return res.status(401).json({ error: "Unauthorized Access",userId: req.session.userId, session:req.session });
}

authRouter.post('/signup', authControllers.postSignup);
authRouter.post('/login', authControllers.postLogin);
authRouter.post('/logout', authControllers.postLogout);
authRouter.post("/", requireAuth, authControllers.getHome);
authRouter.post('/home',requireAuth, authControllers.getHome);


module.exports = authRouter;