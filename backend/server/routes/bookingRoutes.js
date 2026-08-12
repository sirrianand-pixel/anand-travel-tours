const express = require("express");

const router =
    express.Router();


const {

    createBooking,

    getBookings,

    getMyBookings,

    getBooking,

    updateBookingStatus

} = require("../controllers/bookingController");


const {

    authenticateToken,

    requireAdmin

} = require("../middleware/authMiddleware");


// ==========================================================
// CREATE BOOKING
// CUSTOMER - LOGIN REQUIRED
// ==========================================================

router.post(
    "/",
    authenticateToken,
    createBooking
);


// ==========================================================
// GET MY BOOKINGS
// CUSTOMER
// IMPORTANT: This must come BEFORE /:id
// ==========================================================

router.get(
    "/my",
    authenticateToken,
    getMyBookings
);


// ==========================================================
// GET ALL BOOKINGS
// ADMIN ONLY
// ==========================================================

router.get(
    "/",
    authenticateToken,
    requireAdmin,
    getBookings
);


// ==========================================================
// GET ONE BOOKING
// ADMIN ONLY
// ==========================================================

router.get(
    "/:id",
    authenticateToken,
    requireAdmin,
    getBooking
);


// ==========================================================
// UPDATE BOOKING STATUS
// ADMIN ONLY
// ==========================================================

router.patch(
    "/:id/status",
    authenticateToken,
    requireAdmin,
    updateBookingStatus
);


module.exports =
    router;