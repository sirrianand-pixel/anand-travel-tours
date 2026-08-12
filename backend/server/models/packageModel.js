const db = require("../config/db");

// ==========================================
// GET ALL PACKAGES
// ==========================================

const getAllPackages = (callback) => {

    const sql = `
        SELECT *
        FROM packages
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, results) => {
        callback(err, results);
    });

};


// ==========================================
// GET PACKAGE BY ID
// ==========================================

const getPackageById = (id, callback) => {

    const sql = `
        SELECT *
        FROM packages
        WHERE id = ?
    `;

    db.query(sql, [id], (err, results) => {
        callback(err, results);
    });

};


// ==========================================
// CREATE PACKAGE
// ==========================================

const createPackage = (packageData, callback) => {

    const sql = `
        INSERT INTO packages
        (
            title,
            destination,
            description,
            duration,
            persons,
            price,
            image,
            tag
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        packageData.title,
        packageData.destination,
        packageData.description,
        packageData.duration,
        packageData.persons,
        packageData.price,
        packageData.image,
        packageData.tag
    ];

    db.query(
        sql,
        values,
        (err, result) => {
            callback(err, result);
        }
    );

};


// ==========================================
// UPDATE PACKAGE
// ==========================================

const updatePackage = (id, packageData, callback) => {

    const sql = `
        UPDATE packages

        SET
            title = ?,
            destination = ?,
            description = ?,
            duration = ?,
            persons = ?,
            price = ?,
            image = ?,
            tag = ?

        WHERE id = ?
    `;

    const values = [
        packageData.title,
        packageData.destination,
        packageData.description,
        packageData.duration,
        packageData.persons,
        packageData.price,
        packageData.image,
        packageData.tag,
        id
    ];

    db.query(
        sql,
        values,
        (err, result) => {
            callback(err, result);
        }
    );

};


// ==========================================
// DELETE PACKAGE
// ==========================================

const deletePackage = (id, callback) => {

    const sql = `
        DELETE FROM packages
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


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getAllPackages,
    getPackageById,
    createPackage,
    updatePackage,
    deletePackage

};