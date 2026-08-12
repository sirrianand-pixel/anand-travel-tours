const crypto = require("crypto");
const razorpay = require("../config/razorpay");


// ==========================================================
// CREATE RAZORPAY ORDER
// ==========================================================

const createPaymentOrder = async (req, res) => {

    try {

        const {
            amount,
            booking_id
        } = req.body;


        if (!amount) {

            return res.status(400).json({
                success: false,
                message: "Amount is required"
            });

        }


        const numericAmount =
            Number(amount);


        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid payment amount"
            });

        }


        const options = {

            amount:
                Math.round(
                    numericAmount * 100
                ),

            currency: "INR",

            receipt:
                `booking_${booking_id || Date.now()}`,

            notes: {

                booking_id:
                    String(
                        booking_id || ""
                    ),

                user_id:
                    String(
                        req.user?.id || ""
                    )

            }

        };


        const order =
            await razorpay.orders.create(
                options
            );


        res.status(201).json({

            success: true,

            order: {

                id:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

                receipt:
                    order.receipt

            }

        });

    } catch (error) {

        console.error(
            "Create Razorpay order error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to create payment order",

            error:
                error.message

        });

    }

};


// ==========================================================
// VERIFY RAZORPAY PAYMENT
// ==========================================================

const verifyPayment = async (
    req,
    res
) => {

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

                message:
                    "Payment verification data is incomplete"

            });

        }


        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_order_id}|${razorpay_payment_id}`
                )
                .digest("hex");


        const isValid =
            generatedSignature ===
            razorpay_signature;


        if (!isValid) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid payment signature"

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Payment verified successfully",

            payment: {

                order_id:
                    razorpay_order_id,

                payment_id:
                    razorpay_payment_id

            }

        });

    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Payment verification failed",

            error:
                error.message

        });

    }

};


module.exports = {

    createPaymentOrder,

    verifyPayment

};