const express = require("express");

const router = express.Router();


const {
    getPackages,
    getPackage,
    createPackage,
    updatePackage,
    deletePackage
} = require("../controllers/packageController");


const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");


// ==========================================
// PUBLIC PACKAGE ROUTES
// ==========================================

// GET ALL PACKAGES

router.get(
    "/",
    getPackages
);


// GET ONE PACKAGE

router.get(
    "/:id",
    getPackage
);


// ==========================================
// ADMIN PACKAGE ROUTES
// ==========================================

// CREATE PACKAGE

router.post(
    "/",
    authenticateToken,
    requireAdmin,
    createPackage
);


// UPDATE PACKAGE

router.put(
    "/:id",
    authenticateToken,
    requireAdmin,
    updatePackage
);


// DELETE PACKAGE

router.delete(
    "/:id",
    authenticateToken,
    requireAdmin,
    deletePackage
);


module.exports = router;