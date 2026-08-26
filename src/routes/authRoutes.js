const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

// User signup
router.post(
    "/signup",
    authController.signup
);

// User login
router.post(
    "/login",
    authController.login
);

// Get user profile (protected route)
router.get(
    "/profile",
    verifyToken,
    authController.profile
);

// Email verification (link from email)
// Signup ke baad email pe link aata hai - user click karta hai
router.get(
    "/verify-email",
    authController.verifyEmail
);

// Request password reset link
// User email bhejta hai - reset link email pe jata hai
router.post(
    "/forgot-password",
    authController.forgotPassword
);

// Reset password with token
// User token + naya password bhejta hai - password change hota hai
router.post(
    "/reset-password",
    authController.resetPassword
);

module.exports = router;