const userModel = require("../models/userModel");


// ==========================================================
// GET ALL USERS
// ==========================================================

const getUsers = (
    req,
    res
) => {

    userModel.getAllUsers(
        (err, results) => {

            if (err) {

                console.error(
                    "Get users error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch users",
                    error: err.message
                });

            }

            res.status(200).json({
                success: true,
                users: results
            });

        }
    );

};


// ==========================================================
// GET USER BY ID
// ==========================================================

const getUser = (
    req,
    res
) => {

    const { id } = req.params;

    userModel.getUserById(
        id,
        (err, results) => {

            if (err) {

                console.error(
                    "Get user error:",
                    err
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to fetch user",
                    error: err.message
                });

            }

            if (results.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });

            }

            res.status(200).json({
                success: true,
                user: results[0]
            });

        }
    );

};


// ==========================================================
// UPDATE USER ROLE
// ==========================================================

const updateUserRole = (
    req,
    res
) => {

    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = [
        "user",
        "admin"
    ];


    // ------------------------------------------
    // Validate role
    // ------------------------------------------

    if (!allowedRoles.includes(role)) {

        return res.status(400).json({
            success: false,
            message:
                "Invalid role. Allowed roles are user and admin."
        });

    }


    // ------------------------------------------
    // Prevent current admin from changing
    // their own role when user ID is available
    // in the JWT.
    // ------------------------------------------

    const authenticatedUserId =
        req.user?.id ??
        req.user?.userId ??
        req.user?.user_id;


    if (
        authenticatedUserId &&
        String(authenticatedUserId) === String(id)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "You cannot change your own administrator role."
        });

    }


    // ------------------------------------------
    // Find target user
    // ------------------------------------------

    userModel.getUserById(
        id,
        (findErr, users) => {

            if (findErr) {

                console.error(
                    "Find user role error:",
                    findErr
                );

                return res.status(500).json({
                    success: false,
                    message: "Failed to find user",
                    error: findErr.message
                });

            }


            if (users.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });

            }


            const currentUser =
                users[0];


            // ------------------------------------------
            // Do not remove the final admin
            // ------------------------------------------

            if (
                currentUser.role === "admin" &&
                role === "user"
            ) {

                userModel.countAdmins(
                    (
                        countErr,
                        countResults
                    ) => {

                        if (countErr) {

                            console.error(
                                "Count admins error:",
                                countErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Failed to verify administrator count",
                                error:
                                    countErr.message
                            });

                        }


                        const adminCount =
                            Number(
                                countResults[0]?.admin_count || 0
                            );


                        if (
                            adminCount <= 1
                        ) {

                            return res.status(400).json({
                                success: false,
                                message:
                                    "Cannot remove the last administrator."
                            });

                        }


                        performRoleUpdate();

                    }
                );

                return;
            }


            performRoleUpdate();


            // ------------------------------------------
            // Perform update
            // ------------------------------------------

            function performRoleUpdate() {

                userModel.updateUserRole(
                    id,
                    role,
                    (
                        updateErr,
                        result
                    ) => {

                        if (updateErr) {

                            console.error(
                                "Update role error:",
                                updateErr
                            );

                            return res.status(500).json({
                                success: false,
                                message:
                                    "Failed to update user role",
                                error:
                                    updateErr.message
                            });

                        }


                        if (
                            result.affectedRows === 0
                        ) {

                            return res.status(404).json({
                                success: false,
                                message:
                                    "User not found"
                            });

                        }


                        res.status(200).json({
                            success: true,
                            message:
                                `User role changed to ${role} successfully`
                        });

                    }
                );

            }

        }
    );

};


// ==========================================================
// DELETE USER
// ==========================================================

const deleteUser = (
    req,
    res
) => {

    const { id } = req.params;


    // ------------------------------------------
    // Prevent deleting current admin
    // ------------------------------------------

    const authenticatedUserId =
        req.user?.id ??
        req.user?.userId ??
        req.user?.user_id;


    if (
        authenticatedUserId &&
        String(authenticatedUserId) === String(id)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "You cannot delete your own account from the admin panel."
        });

    }


    userModel.getUserById(
        id,
        (findErr, users) => {

            if (findErr) {

                console.error(
                    "Find user before delete error:",
                    findErr
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Failed to find user",
                    error:
                        findErr.message
                });

            }


            if (users.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "User not found"
                });

            }


            const user =
                users[0];


            // ------------------------------------------
            // Never delete an admin from this UI
            // ------------------------------------------

            if (
                user.role === "admin"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Administrator accounts cannot be deleted from the user management panel."
                });

            }


            // ------------------------------------------
            // Delete user
            // ------------------------------------------

            userModel.deleteUser(
                id,
                (
                    deleteErr,
                    result
                ) => {

                    if (deleteErr) {

                        console.error(
                            "Delete user error:",
                            deleteErr
                        );

                        return res.status(500).json({
                            success: false,
                            message:
                                "Failed to delete user",
                            error:
                                deleteErr.message
                        });

                    }


                    if (
                        result.affectedRows === 0
                    ) {

                        return res.status(404).json({
                            success: false,
                            message:
                                "User not found"
                        });

                    }


                    res.status(200).json({
                        success: true,
                        message:
                            "User deleted successfully"
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

    getUsers,
    getUser,
    updateUserRole,
    deleteUser

};