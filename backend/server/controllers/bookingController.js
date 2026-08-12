const bookingModel = require("../models/bookingModel");


// ==========================================================
// GET USER ID FROM JWT
// ==========================================================

const getAuthenticatedUserId = (
    req
) => {

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

const createBooking = (
    req,
    res
) => {

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

    const userId =
        getAuthenticatedUserId(
            req
        );


    if (!userId) {

        return res.status(401).json({

            success: false,

            message:
                "Unable to identify authenticated user"

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
        !persons
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Please fill all required fields"

        });

    }


    // ------------------------------------------
    // BUILD BOOKING
    // ------------------------------------------

    const booking = {

        user_id:
            userId,

        package_id:
            package_id,

        full_name:
            full_name,

        email:
            email,

        phone:
            phone,

        travel_date:
            travel_date,

        persons:
            persons,

        message:
            message || null

    };


    bookingModel.createBooking(
        booking,
        (err, result) => {

            if (err) {

                console.error(
                    "Booking error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to create booking",

                    error:
                        err.message

                });

            }


            res.status(201).json({

                success: true,

                message:
                    "Booking created successfully",

                booking_id:
                    result.insertId

            });

        }
    );

};


// ==========================================================
// GET ALL BOOKINGS
// ADMIN
// ==========================================================

const getBookings = (
    req,
    res
) => {

    bookingModel.getAllBookings(
        (err, results) => {

            if (err) {

                console.error(
                    "Database error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to fetch bookings",

                    error:
                        err.message

                });

            }


            res.status(200).json({

                success: true,

                bookings:
                    results

            });

        }
    );

};


// ==========================================================
// GET MY BOOKINGS
// CUSTOMER
// ==========================================================

const getMyBookings = (
    req,
    res
) => {

    const userId =
        getAuthenticatedUserId(
            req
        );


    if (!userId) {

        return res.status(401).json({

            success: false,

            message:
                "Unable to identify authenticated user"

        });

    }


    bookingModel.getBookingsByUserId(
        userId,
        (err, results) => {

            if (err) {

                console.error(
                    "Get my bookings error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to fetch your bookings",

                    error:
                        err.message

                });

            }


            res.status(200).json({

                success: true,

                bookings:
                    results

            });

        }
    );

};


// ==========================================================
// GET BOOKING BY ID
// ADMIN
// ==========================================================

const getBooking = (
    req,
    res
) => {

    const { id } =
        req.params;


    bookingModel.getBookingById(
        id,
        (err, results) => {

            if (err) {

                console.error(
                    "Get booking error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to get booking",

                    error:
                        err.message

                });

            }


            if (
                results.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found"

                });

            }


            res.status(200).json({

                success: true,

                booking:
                    results[0]

            });

        }
    );

};


// ==========================================================
// UPDATE BOOKING STATUS
// ADMIN
// ==========================================================

const updateBookingStatus = (
    req,
    res
) => {

    const { id } =
        req.params;

    const { status } =
        req.body;


    const allowedStatuses = [

        "Pending",
        "Confirmed",
        "Cancelled"

    ];


    if (
        !allowedStatuses.includes(
            status
        )
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid booking status"

        });

    }


    bookingModel.updateBookingStatus(
        id,
        status,
        (err, result) => {

            if (err) {

                console.error(
                    "Update booking error:",
                    err
                );


                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to update booking",

                    error:
                        err.message

                });

            }


            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Booking not found"

                });

            }


            res.status(200).json({

                success: true,

                message:
                    `Booking ${status.toLowerCase()} successfully`

            });

        }
    );

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