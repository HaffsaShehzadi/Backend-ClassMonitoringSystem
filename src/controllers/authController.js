const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userModel = require("../models/userModel");
const emailService = require("../services/emailService");

// Auth Controller
// Signup + Email Verify + Login
// + Forgot Password + Reset Password
class AuthController {

    // Signup method
    async signup(req, res) {
        try {
            const { name, email, password, role, department } = req.body;

            if (!name || !email || !password || !role) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // Email pehle se registered?
            const existing = await userModel.findUserByEmail(email);
            if (existing) {
                return res.status(400).json({ message: "Email already exists" });
            }

            // Password hash
            const hashedPassword = await bcrypt.hash(password, 10);

            // Department id lana (teacher ke liye)
            let departmentId = null;
            if (department) {
                departmentId = await userModel.getOrCreateDepartment(department);
            }

            // User create (email_verified = 0, status = pending)
            await userModel.createUser({
                name,
                email,
                password: hashedPassword,
                role,
                departmentId
            });

            // Email verification token banao (24 ghante valid)
            const verifyToken = jwt.sign(
                { email: email, purpose: "verify" },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            // Verification email bhejo
            await emailService.sendVerificationEmail(email, verifyToken);

            res.status(201).json({
                message: "Signup successful! Verification link sent to your email"
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // Verify email method
    async verifyEmail(req, res) {
        try {
            const { token } = req.query;

            if (!token) {
                return res.status(400).json({ message: "Verification token missing" });
            }

            // Token verify karo
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(400).json({ message: "Invalid or expired verification link" });
            }

            // Check: ye verification token hai?
            if (decoded.purpose !== "verify") {
                return res.status(400).json({ message: "Invalid token type" });
            }

            // Email verified mark karo
            await userModel.verifyEmail(decoded.email);

            res.json({
                message: "Email verified successfully. Please wait for admin approval."
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // Login method
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // User dhundo
            const user = await userModel.findUserByEmail(email);
            if (!user) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // Password match
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            // Email verified check
            if (!user.email_verified) {
                return res.status(403).json({
                    message: "Please verify your email address first"
                });
            }

            // Approval check
            if (user.status === "pending") {
                return res.status(200).json({
                    status: "pending",
                    message: "Your account is pending admin approval"
                });
            }
            if (user.status === "rejected") {
                return res.status(403).json({
                    status: "rejected",
                    message: "Your account has been rejected. Please contact admin."
                });
            }

            // JWT token (no expiry - existing style)
            const token = jwt.sign(
                { user_id: user.id, role: user.role },
                process.env.JWT_SECRET
            );

            res.status(200).json({
                status: "approved",
                message: "Login successful",
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    department: user.department
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // Profile method
    profile(req, res) {
        res.status(200).json({
            message: "Profile loaded",
            user: req.user
        });
    }

    // Forgot password method
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }

            const user = await userModel.findUserByEmail(email);

            // Security: email na mile to bhi same message do
            if (!user) {
                return res.json({
                    message: "If the email is registered, a reset link has been sent"
                });
            }

            // Email verified hona zaroori hai
            if (!user.email_verified) {
                return res.status(403).json({
                    message: "Please verify your email before requesting a password reset"
                });
            }

            // Secure random token
            const resetToken = crypto.randomBytes(32).toString("hex");

            // 1 ghante baad expire
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

            // DB mein save
            await userModel.createResetToken(email, resetToken, expiresAt);

            // Reset email bhejo
            await emailService.sendPasswordResetEmail(email, resetToken);

            res.json({
                message: "Password reset link has been sent to your email"
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // Reset password method
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({ message: "Token and new password are required" });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters" });
            }

            // Valid token dhundo
            const resetRecord = await userModel.findValidResetToken(token);
            if (!resetRecord) {
                return res.status(400).json({ message: "Invalid or expired reset link" });
            }

            // Naya password hash
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Password update
            await userModel.updatePassword(resetRecord.email, hashedPassword);

            // Token used mark karo
            await userModel.markResetTokenUsed(token);

            res.json({
                message: "Password has been reset successfully. You can now login with your new password."
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new AuthController();