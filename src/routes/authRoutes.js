const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");

// User registration & OTP
router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);

// User login
router.post("/login", authController.login);

// Current user profile
router.get("/profile", verifyToken, authController.profile);

// Password reset
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Account status check
router.get("/status", authController.checkStatus);
router.post("/status", authController.checkStatus);

module.exports = router;