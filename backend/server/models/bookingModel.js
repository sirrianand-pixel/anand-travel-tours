const db = require("../config/db");


// ==========================================================
// CREATE BOOKING
// ==========================================================

const createBooking = (
    booking,
    callback
) => {

    const sql = `
        INSERT INTO bookings
        (
            user_id,
            package_id,
            full_name,
            email,
            phone,
            travel_date,
            persons,
            message
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;


    const values = [

        booking.user_id,
        booking.package_id,
        booking.full_name,
        booking.email,
        booking.phone,
        booking.travel_date,
        booking.persons,
        booking.message

    ];


    db.query(
        sql,
        values,
        (err, result) => {

            callback(
                err,
                result
            );

        }
    );

};


// ==========================================================
// GET ALL BOOKINGS
// ADMIN
// ==========================================================

const getAllBookings = (
    callback
) => {

    const sql = `
        SELECT
            bookings.*,
            packages.title AS package_title,
            packages.destination,
            packages.duration,
            packages.price
        FROM bookings
        JOIN packages
            ON bookings.package_id = packages.id
        ORDER BY bookings.created_at DESC
    `;


    db.query(
        sql,
        (err, results) => {

            callback(
                err,
                results
            );

        }
    );

};


// ==========================================================
// GET BOOKING BY ID
// ADMIN
// ==========================================================

const getBookingById = (
    id,
    callback
) => {

    const sql = `
        SELECT
            bookings.*,
            packages.title AS package_title,
            packages.destination,
            packages.duration,
            packages.price
        FROM bookings
        JOIN packages
            ON bookings.package_id = packages.id
        WHERE bookings.id = ?
    `;


    db.query(
        sql,
        [id],
        (err, results) => {

            callback(
                err,
                results
            );

        }
    );

};


// ==========================================================
// GET BOOKINGS OF ONE USER
// CUSTOMER
// ==========================================================

const getBookingsByUserId = (
    userId,
    callback
) => {

    const sql = `
        SELECT
            bookings.*,
            packages.title AS package_title,
            packages.destination,
            packages.duration,
            packages.price,
            packages.image AS package_image,
            packages.tag AS package_tag
        FROM bookings
        JOIN packages
            ON bookings.package_id = packages.id
        WHERE bookings.user_id = ?
        ORDER BY bookings.created_at DESC
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
// UPDATE BOOKING STATUS
// ADMIN
// ==========================================================

const updateBookingStatus = (
    id,
    status,
    callback
) => {

    const sql = `
        UPDATE bookings
        SET status = ?
        WHERE id = ?
    `;


    db.query(
        sql,
        [status, id],
        (err, result) => {

            callback(
                err,
                result
            );

        }
    );

};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    createBooking,

    getAllBookings,

    getBookingById,

    getBookingsByUserId,

    updateBookingStatus

};