const db = require("../config/db");


// Dashboard statistics
const getDashboardStats = (req, res) => {

    const queries = {
        users: "SELECT COUNT(*) AS total FROM users",

        packages: "SELECT COUNT(*) AS total FROM packages",

        bookings: "SELECT COUNT(*) AS total FROM bookings",

        pendingBookings:
            "SELECT COUNT(*) AS total FROM bookings WHERE status = 'Pending'",

        confirmedBookings:
            "SELECT COUNT(*) AS total FROM bookings WHERE status = 'Confirmed'",

        cancelledBookings:
            "SELECT COUNT(*) AS total FROM bookings WHERE status = 'Cancelled'",

        revenue:
            `SELECT COALESCE(SUM(p.price * b.persons), 0) AS total
             FROM bookings b
             JOIN packages p ON b.package_id = p.id
             WHERE b.status = 'Confirmed'`
    };


    db.query(queries.users, (err, usersResult) => {

        if (err) {
            return res.status(500).json({
                message: "Failed to get users count",
                error: err.message
            });
        }


        db.query(queries.packages, (err, packagesResult) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to get packages count",
                    error: err.message
                });
            }


            db.query(queries.bookings, (err, bookingsResult) => {

                if (err) {
                    return res.status(500).json({
                        message: "Failed to get bookings count",
                        error: err.message
                    });
                }


                db.query(
                    queries.pendingBookings,
                    (err, pendingResult) => {

                        if (err) {
                            return res.status(500).json({
                                message: "Failed to get pending bookings",
                                error: err.message
                            });
                        }


                        db.query(
                            queries.confirmedBookings,
                            (err, confirmedResult) => {

                                if (err) {
                                    return res.status(500).json({
                                        message: "Failed to get confirmed bookings",
                                        error: err.message
                                    });
                                }


                                db.query(
                                    queries.cancelledBookings,
                                    (err, cancelledResult) => {

                                        if (err) {
                                            return res.status(500).json({
                                                message: "Failed to get cancelled bookings",
                                                error: err.message
                                            });
                                        }


                                        db.query(
                                            queries.revenue,
                                            (err, revenueResult) => {

                                                if (err) {
                                                    return res.status(500).json({
                                                        message: "Failed to get revenue",
                                                        error: err.message
                                                    });
                                                }


                                                res.json({
                                                    success: true,

                                                    stats: {
                                                        totalUsers:
                                                            usersResult[0].total,

                                                        totalPackages:
                                                            packagesResult[0].total,

                                                        totalBookings:
                                                            bookingsResult[0].total,

                                                        pendingBookings:
                                                            pendingResult[0].total,

                                                        confirmedBookings:
                                                            confirmedResult[0].total,

                                                        cancelledBookings:
                                                            cancelledResult[0].total,

                                                        revenue:
                                                            revenueResult[0].total
                                                    }
                                                });

                                            }
                                        );

                                    }
                                );

                            }
                        );

                    }
                );

            });

        });

    });

};


module.exports = {
    getDashboardStats
};