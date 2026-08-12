const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==========================
// REGISTER USER
// ==========================
const registerUser = async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        // Check if email already exists
        const checkUser = "SELECT * FROM users WHERE email = ?";

        db.query(checkUser, [email], async (err, result) => {
            if (err) {
                return res.status(500).json({
                    message: "Database Error",
                    error: err
                });
            }

            if (result.length > 0) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }

            // Encrypt password
            const hashedPassword = await bcrypt.hash(password, 10);

            const insertQuery = `
                INSERT INTO users (full_name, email, phone, password)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                insertQuery,
                [full_name, email, phone, hashedPassword],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({
                            message: "Registration Failed",
                            error: err
                        });
                    }

                    res.status(201).json({
                        message: "Registration Successful"
                    });
                }
            );
        });

    } catch (error) {
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

// ==========================
// LOGIN USER
// ==========================
const loginUser = async (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Database Error",
                error: err
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login Successful",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        });

    });

};

// ==========================
// EXPORTS
// ==========================
module.exports = {
    registerUser,
    loginUser
};