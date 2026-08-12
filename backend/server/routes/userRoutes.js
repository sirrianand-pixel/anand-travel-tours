const express = require("express");

const router = express.Router();


const {
    getUsers,
    getUser,
    updateUserRole,
    deleteUser
} = require("../controllers/userController");


const {
    authenticateToken,
    requireAdmin
} = require("../middleware/authMiddleware");


// ==========================================================
// GET ALL USERS
// ==========================================================

router.get(
    "/",
    authenticateToken,
    requireAdmin,
    getUsers
);


// ==========================================================
// GET ONE USER
// ==========================================================

router.get(
    "/:id",
    authenticateToken,
    requireAdmin,
    getUser
);


// ==========================================================
// UPDATE USER ROLE
// ==========================================================

router.patch(
    "/:id/role",
    authenticateToken,
    requireAdmin,
    updateUserRole
);


// ==========================================================
// DELETE USER
// ==========================================================

router.delete(
    "/:id",
    authenticateToken,
    requireAdmin,
    deleteUser
);


module.exports = router;