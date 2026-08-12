const express = require("express");
const path = require("path");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const packageRoutes = require("./routes/packageRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const db = require("./config/db");

const {
    verifyEmailTransporter
} = require("./services/emailService");

const app = express();


// ==========================================================
// MIDDLEWARE
// ==========================================================

app.use(cors());

app.use(express.json());


// ==========================================================
// FRONTEND PATH
// ==========================================================
//
// server.js is here:
//
// anand_traveltours/
// └── backend/
//     └── server/
//         └── server.js
//
// Frontend is here:
//
// anand_traveltours/
// ├── index.html
// ├── css/
// ├── js/
// ├── images/
// └── pages/
//
// Therefore ../../ points to anand_traveltours/
// ==========================================================

const frontendPath = path.join(
    __dirname,
    "../../"
);


// ==========================================================
// SERVE FRONTEND FILES
// ==========================================================

app.use(
    express.static(frontendPath)
);


// ==========================================================
// ROOT PAGE
// ==========================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            frontendPath,
            "index.html"
        )
    );

});


// ==========================================================
// API ROUTES
// ==========================================================

// AUTHENTICATION

app.use(
    "/api/auth",
    authRoutes
);


// PACKAGES

app.use(
    "/api/packages",
    packageRoutes
);


// BOOKINGS

app.use(
    "/api/bookings",
    bookingRoutes
);


// ADMIN DASHBOARD

app.use(
    "/api/admin",
    adminRoutes
);


// ADMIN USER MANAGEMENT

app.use(
    "/api/admin/users",
    userRoutes
);


// ==========================================================
// SERVER
// ==========================================================

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🚀 Server running on port ${PORT}`
        );

        console.log(
            `📁 Frontend served from: ${frontendPath}`
        );
        console.log(
    `🌐 Local website: http://localhost:${PORT}`
);

    }
);