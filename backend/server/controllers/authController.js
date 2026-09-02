const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendPasswordResetEmail } = require("../services/emailService");

// ==========================
// REGISTER USER
// ==========================
const registerUser = async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        // Validate required fields
        if (!full_name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields: full_name, email, phone, and password"
            });
        }

        const trimmedEmail = String(email).trim().toLowerCase();
        const trimmedName = String(full_name).trim();
        const trimmedPhone = String(phone).trim();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        // Validate password length
        if (typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if email already exists
        const checkUser = "SELECT id FROM users WHERE email = ?";

        db.query(checkUser, [trimmedEmail], async (err, result) => {
            if (err) {
                console.error("Database query error in registration:", err);
                return res.status(500).json({
                    success: false,
                    message: "An internal error occurred during registration"
                });
            }

            if (result.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already registered. Please login or use a different email."
                });
            }

            try {
                // Encrypt password
                const hashedPassword = await bcrypt.hash(password, 10);

                const insertQuery = `
                    INSERT INTO users (full_name, email, phone, password, role)
                    VALUES (?, ?, ?, ?, 'user')
                `;

                db.query(
                    insertQuery,
                    [trimmedName, trimmedEmail, trimmedPhone, hashedPassword],
                    (insertErr, insertResult) => {
                        if (insertErr) {
                            console.error("Database insert error in registration:", insertErr);
                            return res.status(500).json({
                                success: false,
                                message: "Registration failed. Please try again."
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: "Registration successful"
                        });
                    }
                );
            } catch (hashError) {
                console.error("Password hashing error:", hashError);
                return res.status(500).json({
                    success: false,
                    message: "Failed to secure password"
                });
            }
        });

    } catch (error) {
        console.error("Server error in registerUser:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ==========================
// LOGIN USER
// ==========================
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const trimmedEmail = String(email).trim().toLowerCase();

        const sql = "SELECT id, full_name, email, password, role FROM users WHERE email = ?";

        db.query(sql, [trimmedEmail], async (err, result) => {
            if (err) {
                console.error("Database query error in loginUser:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database Error"
                });
            }

            if (result.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const user = result[0];

            // Compare password
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password"
                });
            }

            const jwtSecret = process.env.JWT_SECRET || "anand_traveltours_jwt_secret";

            // Generate JWT Token
            const token = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },
                jwtSecret,
                {
                    expiresIn: "1d"
                }
            );

            res.status(200).json({
                success: true,
                message: "Login Successful",
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (error) {
        console.error("Server error in loginUser:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ==========================
// FORGOT PASSWORD
// ==========================
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email address is required"
            });
        }

        const trimmedEmail = String(email).trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address"
            });
        }

        const sql = "SELECT id, full_name, email, password FROM users WHERE email = ?";

        db.query(sql, [trimmedEmail], async (err, results) => {
            if (err) {
                console.error("Database query error in forgotPassword:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database error occurred"
                });
            }

            // Generic success response prevents user enumeration
            const genericMessage = "If this email address is registered, a password reset link has been sent.";

            if (results.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: genericMessage
                });
            }

            const user = results[0];
            const jwtSecret = process.env.JWT_SECRET || "anand_traveltours_jwt_secret";
            const resetSecret = `${jwtSecret}_${user.password}`;

            const resetToken = jwt.sign(
                {
                    id: user.id,
                    email: user.email,
                    purpose: "password_reset"
                },
                resetSecret,
                {
                    expiresIn: "1h"
                }
            );

            const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
            const host = req.headers["x-forwarded-host"] || req.get("host") || "localhost:5000";
            const resetLink = `${protocol}://${host}/pages/reset-password.html?token=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(user.email)}`;

            try {
                if (typeof sendPasswordResetEmail === "function") {
                    await sendPasswordResetEmail({
                        email: user.email,
                        full_name: user.full_name,
                        reset_link: resetLink
                    });
                }
            } catch (emailErr) {
                console.warn("Password reset email warning:", emailErr.message);
            }

            res.status(200).json({
                success: true,
                message: genericMessage
            });
        });
    } catch (error) {
        console.error("Server error in forgotPassword:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ==========================
// RESET PASSWORD
// ==========================
const resetPassword = async (req, res) => {
    try {
        const { token, new_password } = req.body;

        if (!token || !new_password) {
            return res.status(400).json({
                success: false,
                message: "Reset token and new password are required"
            });
        }

        if (typeof new_password !== "string" || new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        const decoded = jwt.decode(token);
        if (!decoded || !decoded.id || decoded.purpose !== "password_reset") {
            return res.status(400).json({
                success: false,
                message: "Invalid or malformed reset token"
            });
        }

        const sql = "SELECT id, full_name, email, password FROM users WHERE id = ?";

        db.query(sql, [decoded.id], async (err, results) => {
            if (err) {
                console.error("Database query error in resetPassword:", err);
                return res.status(500).json({
                    success: false,
                    message: "Database error occurred"
                });
            }

            if (results.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "User not found or invalid token"
                });
            }

            const user = results[0];
            const jwtSecret = process.env.JWT_SECRET || "anand_traveltours_jwt_secret";
            const resetSecret = `${jwtSecret}_${user.password}`;

            try {
                jwt.verify(token, resetSecret);
            } catch (verifyErr) {
                return res.status(400).json({
                    success: false,
                    message: "Reset link has expired or has already been used. Please request a new one."
                });
            }

            try {
                const hashedPassword = await bcrypt.hash(new_password, 10);
                const updateSql = "UPDATE users SET password = ? WHERE id = ?";

                db.query(updateSql, [hashedPassword, user.id], (updateErr) => {
                    if (updateErr) {
                        console.error("Database update error in resetPassword:", updateErr);
                        return res.status(500).json({
                            success: false,
                            message: "Failed to reset password. Please try again."
                        });
                    }

                    res.status(200).json({
                        success: true,
                        message: "Password has been successfully reset. You can now login with your new password."
                    });
                });
            } catch (hashErr) {
                console.error("Password hash error in resetPassword:", hashErr);
                return res.status(500).json({
                    success: false,
                    message: "Failed to secure new password"
                });
            }
        });
    } catch (error) {
        console.error("Server error in resetPassword:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

// ==========================
// EXPORTS
// ==========================
module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
};