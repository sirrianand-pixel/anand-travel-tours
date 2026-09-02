const crypto = require("crypto");
const razorpay = require("../config/razorpay");

// ==========================================================
// CREATE RAZORPAY ORDER
// ==========================================================

const createPaymentOrder = async (req, res) => {
    try {
        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: "Online payment gateway is not configured on this server."
            });
        }

        const { amount, booking_id } = req.body;

        if (!amount) {
            return res.status(400).json({
                success: false,
                message: "Amount is required"
            });
        }

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });
        }

        const options = {
            amount: Math.round(numericAmount * 100),
            currency: "INR",
            receipt: `booking_${booking_id || Date.now()}`,
            notes: {
                booking_id: String(booking_id || ""),
                user_id: String(req.user?.id || "")
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(201).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                receipt: order.receipt
            }
        });

    } catch (error) {
        console.error("Create Razorpay order error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to create payment order"
        });
    }
};

// ==========================================================
// VERIFY RAZORPAY PAYMENT
// ==========================================================

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification data is incomplete"
            });
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            return res.status(500).json({
                success: false,
                message: "Payment verification service is unconfigured."
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const isValid = generatedSignature === razorpay_signature;

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            payment: {
                order_id: razorpay_order_id,
                payment_id: razorpay_payment_id
            }
        });

    } catch (error) {
        console.error("Payment verification error:", error.message);
        res.status(500).json({
            success: false,
            message: "Payment verification failed"
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment
};