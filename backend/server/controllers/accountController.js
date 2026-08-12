const accountModel =
    require("../models/accountModel");


// ==========================================================
// GET CURRENT USER ACCOUNT
// ==========================================================

const getMyAccount = (
    req,
    res
) => {

    // JWT contains the user ID.
    const userId =
        req.user?.id ||
        req.user?.userId ||
        req.user?.user_id;


    if (!userId) {

        return res.status(401).json({

            success: false,

            message:
                "Unable to identify authenticated user"

        });

    }


    // ------------------------------------------
    // GET USER
    // ------------------------------------------

    accountModel.getUserById(
        userId,
        (
            userError,
            users
        ) => {

            if (userError) {

                console.error(
                    "Get account error:",
                    userError
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Failed to load account",

                    error:
                        userError.message

                });

            }


            if (
                users.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User account not found"

                });

            }


            const user =
                users[0];


            // ------------------------------------------
            // GET BOOKING STATS
            // ------------------------------------------

            accountModel.getUserBookingStats(
                userId,
                (
                    statsError,
                    statsResults
                ) => {

                    if (statsError) {

                        console.error(
                            "Get booking stats error:",
                            statsError
                        );

                        return res.status(500).json({

                            success: false,

                            message:
                                "Failed to load booking statistics",

                            error:
                                statsError.message

                        });

                    }


                    const stats =
                        statsResults[0] || {};


                    res.status(200).json({

                        success: true,

                        user: {

                            id:
                                user.id,

                            full_name:
                                user.full_name,

                            email:
                                user.email,

                            phone:
                                user.phone,

                            created_at:
                                user.created_at,

                            role:
                                user.role

                        },

                        bookings: {

                            total:
                                Number(
                                    stats.total_bookings || 0
                                ),

                            confirmed:
                                Number(
                                    stats.confirmed_bookings || 0
                                ),

                            pending:
                                Number(
                                    stats.pending_bookings || 0
                                ),

                            cancelled:
                                Number(
                                    stats.cancelled_bookings || 0
                                )

                        }

                    });

                }
            );

        }
    );

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    getMyAccount

};