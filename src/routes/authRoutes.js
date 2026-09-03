const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

// 1. User signup
router.post("/signup", authController.signup);

// 2. Verify OTP (NEW)
router.post("/verify-otp", authController.verifyOTP);

// 3. Resend OTP (NEW)
router.post("/resend-otp", authController.resendOTP);

// 4. User login
router.post("/login", authController.login);

// 5. Get user profile (protected route)
router.get("/profile", verifyToken, authController.profile);

// 6. Email verification (link from email) - OLD (Fallback)
router.get("/verify-email", authController.verifyEmail);

// 7. Request password reset link
router.post("/forgot-password", authController.forgotPassword);

// 8. Reset password with token
router.post("/reset-password", authController.resetPassword);

module.exports = router;