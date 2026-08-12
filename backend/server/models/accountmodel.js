const db = require("../config/db");


// ==========================================================
// GET CURRENT USER
// ==========================================================

const getUserById = (
    userId,
    callback
) => {

    const sql = `
        SELECT
            id,
            full_name,
            email,
            phone,
            created_at,
            role
        FROM users
        WHERE id = ?
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            callback(
                err,
                results
            );

        }
    );

};


// ==========================================================
// GET USER BOOKING STATISTICS
// ==========================================================

const getUserBookingStats = (
    userId,
    callback
) => {

    const sql = `
        SELECT

            COUNT(*) AS total_bookings,

            SUM(
                CASE
                    WHEN status = 'Confirmed'
                    THEN 1
                    ELSE 0
                END
            ) AS confirmed_bookings,

            SUM(
                CASE
                    WHEN status = 'Pending'
                    THEN 1
                    ELSE 0
                END
            ) AS pending_bookings,

            SUM(
                CASE
                    WHEN status = 'Cancelled'
                    THEN 1
                    ELSE 0
                END
            ) AS cancelled_bookings

        FROM bookings

        WHERE user_id = ?
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {

            callback(
                err,
                results
            );

        }
    );

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    getUserById,
    getUserBookingStats

};