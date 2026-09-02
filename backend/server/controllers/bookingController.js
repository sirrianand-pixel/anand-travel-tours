const bookingModel = require("../models/bookingModel");
const packageModel = require("../models/packageModel");
const {
    sendBookingCreatedEmail,
    sendBookingStatusEmail
} = require("../services/emailService");

// ==========================================================
// GET USER ID FROM JWT
// ==========================================================

const getAuthenticatedUserId = (req) => {
    if (!req.user) {
        return null;
    }

    if (req.user.id !== undefined) {
        return req.user.id;
    }

    if (req.user.userId !== undefined) {
        return req.user.userId;
    }

    if (req.user.user_id !== undefined) {
        return req.user.user_id;
    }

    return null;
};

// ==========================================================
// CREATE BOOKING
// ==========================================================

const createBooking = (req, res) => {
    const {
        package_id,
        full_name,
        email,
        phone,
        travel_date,
        persons,
        message
    } = req.body;

    // ------------------------------------------
    // GET USER ID FROM VERIFIED JWT
    // ------------------------------------------

    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unable to identify authenticated user. Please login again."
        });
    }

    // ------------------------------------------
    // VALIDATE REQUIRED FIELDS
    // ------------------------------------------

    if (
        !package_id ||
        !full_name ||
        !email ||
        !phone ||
        !travel_date ||
        persons === undefined ||
        persons === null
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill all required fields: package_id, full_name, email, phone, travel_date, and persons"
        });
    }

    const numPersons = Number(persons);
    if (!Number.isInteger(numPersons) || numPersons < 1) {
        return res.status(400).json({
            success: false,
            message: "Number of persons must be an integer of at least 1"
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email address"
        });
    }

    const trimmedPhone = String(phone).trim();
    if (trimmedPhone.length < 5) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid phone number"
        });
    }

    const numericPackageId = Number(package_id);
    if (!Number.isInteger(numericPackageId) || numericPackageId < 1) {
        return res.status(400).json({
            success: false,
            message: "Invalid package ID"
        });
    }

    // ------------------------------------------
    // VERIFY PACKAGE EXISTS
    // ------------------------------------------

    packageModel.getPackageById(numericPackageId, (pkgErr, pkgResults) => {
        if (pkgErr) {
            console.error("Database error checking package:", pkgErr);
            return res.status(500).json({
                success: false,
                message: "Failed to verify package information"
            });
        }

        if (!pkgResults || pkgResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Selected tour package was not found"
            });
        }

        const selectedPackage = pkgResults[0];

        // ------------------------------------------
        // BUILD BOOKING
        // ------------------------------------------

        const booking = {
            user_id: userId,
            package_id: numericPackageId,
            full_name: String(full_name).trim(),
            email: String(email).trim().toLowerCase(),
            phone: trimmedPhone,
            travel_date: String(travel_date).trim(),
            persons: numPersons,
            message: message ? String(message).trim() : null
        };

        bookingModel.createBooking(booking, (err, result) => {
            if (err) {
                console.error("Booking error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to create booking"
                });
            }

            // Attempt email notification gracefully
            try {
                const emailData = {
                    id: result.insertId,
                    full_name: booking.full_name,
                    email: booking.email,
                    phone: booking.phone,
                    travel_date: booking.travel_date,
                    persons: booking.persons,
                    package_title: selectedPackage.title,
                    destination: selectedPackage.destination
                };
                if (typeof sendBookingCreatedEmail === "function") {
                    sendBookingCreatedEmail(emailData).catch(e => {
                        console.warn("Email service warning:", e.message);
                    });
                }
            } catch (emailErr) {
                // Non-fatal
            }

            res.status(201).json({
                success: true,
                message: "Booking created successfully",
                booking_id: result.insertId
            });
        });
    });
};

// ==========================================================
// GET ALL BOOKINGS (ADMIN)
// ==========================================================

const getBookings = (req, res) => {
    bookingModel.getAllBookings((err, results) => {
        if (err) {
            console.error("Database error in getBookings:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch bookings"
            });
        }

        res.status(200).json({
            success: true,
            bookings: results || []
        });
    });
};

// ==========================================================
// GET MY BOOKINGS (CUSTOMER)
// ==========================================================

const getMyBookings = (req, res) => {
    const userId = getAuthenticatedUserId(req);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unable to identify authenticated user"
        });
    }

    bookingModel.getBookingsByUserId(userId, (err, results) => {
        if (err) {
            console.error("Get my bookings error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch your bookings"
            });
        }

        res.status(200).json({
            success: true,
            bookings: results || []
        });
    });
};

// ==========================================================
// GET BOOKING BY ID (ADMIN OR OWNER)
// ==========================================================

const getBooking = (req, res) => {
    const { id } = req.params;

    bookingModel.getBookingById(id, (err, results) => {
        if (err) {
            console.error("Get booking error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to get booking"
            });
        }

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        const booking = results[0];

        // Authorization check: Admin or booking owner
        const callerId = getAuthenticatedUserId(req);
        const isAdmin = req.user?.role === "admin";

        if (!isAdmin && String(booking.user_id) !== String(callerId)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view this booking"
            });
        }

        res.status(200).json({
            success: true,
            booking
        });
    });
};

// ==========================================================
// UPDATE BOOKING STATUS (ADMIN)
// ==========================================================

const updateBookingStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Confirmed", "Cancelled"];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid booking status. Allowed values: Pending, Confirmed, Cancelled"
        });
    }

    bookingModel.updateBookingStatus(id, status, (err, result) => {
        if (err) {
            console.error("Update booking error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to update booking"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Try to trigger status update email
        bookingModel.getBookingById(id, (findErr, findResults) => {
            if (!findErr && findResults && findResults.length > 0) {
                try {
                    const updatedBooking = findResults[0];
                    if (typeof sendBookingStatusEmail === "function") {
                        sendBookingStatusEmail(updatedBooking).catch(e => {
                            console.warn("Status email warning:", e.message);
                        });
                    }
                } catch (e) {
                    // Non-fatal
                }
            }
        });

        res.status(200).json({
            success: true,
            message: `Booking ${status.toLowerCase()} successfully`
        });
    });
};

// ==========================================================
// EXPORT
// ==========================================================

module.exports = {
    createBooking,
    getBookings,
    getMyBookings,
    getBooking,
    updateBookingStatus
};