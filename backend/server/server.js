const express = require("express");
const path = require("path");
const cors = require("cors");

// Load .env from root or server directory
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const packageRoutes = require("./routes/packageRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const accountRoutes = require("./routes/accountRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const db = require("./config/db");

const {
    verifyEmailTransporter
} = require("./services/emailService");

const app = express();

// ==========================================================
// MIDDLEWARE
// ==========================================================

const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({
    origin: corsOrigin === "*" ? true : corsOrigin,
    credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ==========================================================
// FRONTEND PATH
// ==========================================================

const frontendPath = path.join(__dirname, "../../");

// ==========================================================
// SERVE FRONTEND STATIC FILES
// ==========================================================

app.use(express.static(frontendPath));

// ROOT PAGE
app.get("/", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

// ==========================================================
// HEALTH CHECK ENDPOINT
// ==========================================================

app.get("/api/health", (req, res) => {
    db.query("SELECT 1 AS health", (err) => {
        const isDbHealthy = !err;
        const statusCode = isDbHealthy ? 200 : 503;

        res.status(statusCode).json({
            status: isDbHealthy ? "ok" : "degraded",
            timestamp: new Date().toISOString(),
            service: "Anand Travel Tours API",
            database: isDbHealthy ? "connected" : "disconnected"
        });
    });
});

// ==========================================================
// API ROUTES
// ==========================================================

// AUTHENTICATION
app.use("/api/auth", authRoutes);

// PACKAGES
app.use("/api/packages", packageRoutes);

// BOOKINGS
app.use("/api/bookings", bookingRoutes);

// USER ACCOUNT & PROFILE (supports /api/users/me and /api/account/me)
app.use("/api/users", accountRoutes);
app.use("/api/account", accountRoutes);

// ADMIN DASHBOARD
app.use("/api/admin", adminRoutes);

// ADMIN USER MANAGEMENT
app.use("/api/admin/users", userRoutes);

// PAYMENTS (RAZORPAY)
app.use("/api/payments", paymentRoutes);

// 404 HANDLER FOR UNKNOWN API ROUTES
app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// ==========================================================
// CENTRALIZED ERROR HANDLER
// ==========================================================

app.use((err, req, res, next) => {
    console.error("Unhandled application error:", err.message);
    res.status(err.status || 500).json({
        success: false,
        message: "Internal server error"
    });
});

// ==========================================================
// SERVER INITIALIZATION
// ==========================================================

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📁 Frontend served from: ${frontendPath}`);
        console.log(`🌐 Local Website URL: http://localhost:${PORT}`);

        // Verify email service configuration (non-blocking)
        verifyEmailTransporter();
    });
}

module.exports = app;