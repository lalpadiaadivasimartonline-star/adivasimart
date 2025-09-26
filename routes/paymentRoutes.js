//Core Modules
const path = require("path");
//External Modules
const express = require("express");
const paymentControllers = require("../controllers/paymentControllers");

const paymentRouter = express.Router();

paymentRouter.post('/create-order', paymentControllers.postCreateOrder);

paymentRouter.post("/create-cod-order", paymentControllers.createCODOrder);

paymentRouter.post("/verify-payment", paymentControllers.verifyPayment);

paymentRouter.post("/verify-payment", paymentControllers.verifyPayment);

paymentRouter.post("/refund/:paymentId", paymentControllers.refundPayment);


paymentRouter.post("/test-signature", (req, res) => {
  const { order_id, payment_id, signature } = req.body;

  const sign = order_id + "|" + payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign.toString())
    .digest("hex");

  res.json({
    sign_string: sign,
    expected_signature: expectedSign,
    received_signature: signature,
    match: signature === expectedSign,
    secret_key_exists: !!process.env.RAZORPAY_KEY_SECRET,
    secret_key_length: process.env.RAZORPAY_KEY_SECRET?.length,
  });
});



module.exports = paymentRouter;