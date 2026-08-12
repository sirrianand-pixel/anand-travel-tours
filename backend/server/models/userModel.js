const db = require("../config/db");


// ==========================================================
// GET ALL USERS
// ==========================================================

const getAllUsers = (callback) => {

    const sql = `
        SELECT
            id,
            full_name,
            email,
            phone,
            created_at,
            role
        FROM users
        ORDER BY created_at DESC
    `;

    db.query(
        sql,
        (err, results) => {
            callback(err, results);
        }
    );
};


// ==========================================================
// GET USER BY ID
// ==========================================================

const getUserById = (id, callback) => {

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
        [id],
        (err, results) => {
            callback(err, results);
        }
    );
};


// ==========================================================
// UPDATE USER ROLE
// ==========================================================

const updateUserRole = (
    id,
    role,
    callback
) => {

    const sql = `
        UPDATE users
        SET role = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [role, id],
        (err, result) => {
            callback(err, result);
        }
    );
};


// ==========================================================
// DELETE USER
// ==========================================================

const deleteUser = (
    id,
    callback
) => {

    const sql = `
        DELETE FROM users
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {
            callback(err, result);
        }
    );
};


// ==========================================================
// COUNT ADMIN USERS
// ==========================================================

const countAdmins = (callback) => {

    const sql = `
        SELECT COUNT(*) AS admin_count
        FROM users
        WHERE role = 'admin'
    `;

    db.query(
        sql,
        (err, results) => {
            callback(err, results);
        }
    );
};


// ==========================================================
// EXPORT
// ==========================================================

module.exports = {

    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
    countAdmins

};