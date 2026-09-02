const Razorpay = require("razorpay");
require("dotenv").config();

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } catch (err) {
        console.warn("⚠️ Razorpay initialization warning:", err.message);
    }
}

module.exports = razorpay;