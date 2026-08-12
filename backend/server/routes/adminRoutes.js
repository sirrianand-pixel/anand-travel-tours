const express = require("express");

const router = express.Router();

const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");

const {
    getDashboardStats
} = require("../controllers/adminController");


router.get(
    "/stats",
    authenticateToken,
    requireAdmin,
    getDashboardStats
);


module.exports = router;