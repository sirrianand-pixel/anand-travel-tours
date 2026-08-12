const express = require("express");

const router =
    express.Router();


const {
    getMyAccount
} = require("../controllers/accountController");


const {
    authenticateToken
} = require("../middleware/authMiddleware");


// ==========================================================
// GET MY ACCOUNT
// ==========================================================

router.get(
    "/me",
    authenticateToken,
    getMyAccount
);


module.exports =
    router;