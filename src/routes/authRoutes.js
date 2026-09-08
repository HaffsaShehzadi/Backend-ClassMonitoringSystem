const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

// 1. User signup
router.post("/signup", authController.signup);

// 2. Verify OTP
router.post("/verify-otp", authController.verifyOTP);

// 3. Resend OTP
router.post("/resend-otp", authController.resendOTP);

// 4. User login
router.post("/login", authController.login);

// 5. Get user profile (protected route)
router.get("/profile", verifyToken, authController.profile);

// 6. Request password reset link
router.post("/forgot-password", authController.forgotPassword);

// 7. Reset password with token
router.post("/reset-password", authController.resetPassword);

module.exports = router;