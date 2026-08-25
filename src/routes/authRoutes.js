const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

// ============================================
// EXISTING ROUTES (aapka original code - unchanged)
// ============================================

router.post(
    "/signup",
    authController.signup
);

router.post(
    "/login",
    authController.login
);

router.get(
    "/profile",
    verifyToken,
    authController.profile
);

// ============================================
// ⭐ NAYE ROUTES - Email Verification + Password Reset
// (Ye teeno PUBLIC hain - verifyToken NAHI chahiye)
// ============================================

// GET /api/auth/verify-email?token=xyz
// Signup ke baad email pe link aata hai - user click karta hai
router.get(
    "/verify-email",
    authController.verifyEmail
);

// POST /api/auth/forgot-password
// User email bhejta hai - reset link email pe jata hai
router.post(
    "/forgot-password",
    authController.forgotPassword
);

// POST /api/auth/reset-password
// User token + naya password bhejta hai - password change hota hai
router.post(
    "/reset-password",
    authController.resetPassword
);

module.exports = router;