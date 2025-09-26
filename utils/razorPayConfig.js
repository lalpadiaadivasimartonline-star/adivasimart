require("dotenv").config();
const Razorpay = require("razorpay");

console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID); // Debug log
console.log('Is Live Mode:', process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_')); // Debug log

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
