const packageModel = require("../models/packageModel");


// ==========================================
// GET ALL PACKAGES
// ==========================================

const getPackages = (req, res) => {

    packageModel.getAllPackages(
        (err, results) => {

            if (err) {

                console.error(
                    "Database error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch packages",
                    error: err.message
                });

            }

            res.status(200).json({
                success: true,
                packages: results
            });

        }
    );

};


// ==========================================
// GET PACKAGE BY ID
// ==========================================

const getPackage = (req, res) => {

    const { id } = req.params;

    packageModel.getPackageById(
        id,
        (err, results) => {

            if (err) {

                console.error(
                    "Database error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch package",
                    error: err.message
                });

            }

            if (results.length === 0) {

                return res.status(404).json({
                    message: "Package not found"
                });

            }

            res.status(200).json({
                success: true,
                package: results[0]
            });

        }
    );

};


// ==========================================
// CREATE PACKAGE
// ADMIN ONLY
// ==========================================

const createPackage = (req, res) => {

    const {
        title,
        destination,
        description,
        duration,
        persons,
        price,
        image,
        tag
    } = req.body;


    if (
        !title ||
        !destination ||
        !description ||
        !duration ||
        !persons ||
        !price
    ) {

        return res.status(400).json({
            message: "Please fill all required fields"
        });

    }


    const packageData = {
        title,
        destination,
        description,
        duration,
        persons,
        price,
        image: image || null,
        tag: tag || null
    };


    packageModel.createPackage(
        packageData,
        (err, result) => {

            if (err) {

                console.error(
                    "Create package error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to create package",
                    error: err.message
                });

            }


            res.status(201).json({

                success: true,

                message:
                    "Package created successfully",

                package_id:
                    result.insertId

            });

        }
    );

};


// ==========================================
// UPDATE PACKAGE
// ADMIN ONLY
// ==========================================

const updatePackage = (req, res) => {

    const { id } = req.params;

    const {
        title,
        destination,
        description,
        duration,
        persons,
        price,
        image,
        tag
    } = req.body;


    if (
        !title ||
        !destination ||
        !description ||
        !duration ||
        !persons ||
        !price
    ) {

        return res.status(400).json({
            message: "Please fill all required fields"
        });

    }


    const packageData = {
        title,
        destination,
        description,
        duration,
        persons,
        price,
        image: image || null,
        tag: tag || null
    };


    packageModel.updatePackage(
        id,
        packageData,
        (err, result) => {

            if (err) {

                console.error(
                    "Update package error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to update package",
                    error: err.message
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Package not found"
                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Package updated successfully"

            });

        }
    );

};


// ==========================================
// DELETE PACKAGE
// ADMIN ONLY
// ==========================================

const deletePackage = (req, res) => {

    const { id } = req.params;


    packageModel.deletePackage(
        id,
        (err, result) => {

            if (err) {

                console.error(
                    "Delete package error:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to delete package",
                    error: err.message
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "Package not found"
                });

            }


            res.status(200).json({

                success: true,

                message:
                    "Package deleted successfully"

            });

        }
    );

};


// ==========================================
// EXPORT
// ==========================================

module.exports = {

    getPackages,
    getPackage,
    createPackage,
    updatePackage,
    deletePackage

};