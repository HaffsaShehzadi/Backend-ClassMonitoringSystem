const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const authModel = require("../models/authModel");
const emailService = require("../services/emailService");
class AuthController {
    async signup(req, res) {
        console.log('\n========== SIGNUP REQUEST ==========');
        console.log('Request Body:', { ...req.body, password: '***' });  
        try {
            const { name, email, password, role, department } = req.body;
            if (!name || !email || !password || !role) {
                return res.status(400).json({ message: "All fields are required" });
            }
            const existing = await authModel.findUserByEmail(email);
            if (existing && existing.email_verified) {
                if (existing.status === 'rejected') {
                    return res.status(400).json({ 
                        message: "Your account was rejected by Admin. Please contact Admin to re-approve your account." 
                    });
                }
                return res.status(400).json({ message: "Email already exists. Please login instead." });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            let departmentId = null;
            if (department) {
                departmentId = await authModel.getDepartmentId(department);
            }
            if (role === 'teacher' && !departmentId) {
                return res.status(400).json({ message: "Invalid department selected. Please choose from the list." });
            }

            // ✅ Save user to DB (unverified status)
            if (!existing) {
                await authModel.createUser({
                    name,
                    email,
                    password: hashedPassword,
                    role,
                    departmentId
                });
            } else {
                await authModel.updateUnverifiedUser({
                    name,
                    email,
                    password: hashedPassword,
                    role,
                    departmentId
                });
            }

            // ✅ 4-Digit OTP Generate & Save
            const otp = await authModel.createOTP(email);

            // ✅ REAL EMAIL SEND (OTP terminal pe print nahi hoga)
            try {
                await emailService.sendOTPEmail(email, otp);
            } catch (mailError) {
                console.error('❌ Failed to send OTP email to:', email, mailError.message);
                return res.status(500).json({
                    message: "Failed to send verification email. " + mailError.message,
                    error: mailError.message
                });
            }

            console.log('OTP email sent successfully to:', email);
            res.status(201).json({
                message: "4-digit OTP sent to your email"
            });
        } catch (error) {
            console.log('SIGNUP ERROR:', error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async verifyOTP(req, res) {
        console.log('\n========== VERIFY OTP REQUEST ==========');
        console.log('Request Body:', req.body);
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(400).json({ message: "Email and OTP are required" });
            }
            const isValid = await authModel.verifyOTP(email, otp);
            if (!isValid) {
                return res.status(400).json({ message: "Invalid or expired OTP. Please try again." });
            }
            await authModel.verifyEmail(email);
            res.json({
                message: "Email verified successfully. Please wait for admin approval."
            });
        } catch (error) {
            console.log('VERIFY OTP ERROR:', error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async resendOTP(req, res) {
        console.log('\n========== RESEND OTP REQUEST ==========');
        console.log('Request Body:', req.body);
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }
            const user = await authModel.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            // ✅ New 4-Digit OTP Generate
            const otp = await authModel.createOTP(email);

            // ✅ REAL EMAIL SEND (OTP terminal pe print nahi hoga)
            try {
                await emailService.sendOTPEmail(email, otp);
            } catch (mailError) {
                console.error('❌ Failed to resend OTP email to:', email, mailError.message);
                return res.status(500).json({
                    message: "Failed to resend OTP email. " + mailError.message,
                    error: mailError.message
                });
            }

            console.log('Real OTP email resent successfully to:', email);
            res.json({
                message: "4-digit OTP sent successfully to your email"
            });
        } catch (error) {
            console.log('RESEND OTP ERROR:', error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async login(req, res) {
        console.log('\n========== LOGIN REQUEST ==========');
        console.log('Request Body:', { email: req.body.email, password: '***' });
        try {
            const rawEmail = req.body.email || '';
            const rawPassword = req.body.password || '';
            const email = rawEmail.trim().toLowerCase();
            const password = rawPassword.trim();

            if (!email || !password) {
                return res.status(400).json({ message: "Email and password are required" });
            }

            console.log('Searching for user:', email);
            const user = await authModel.findUserByEmail(email);          
            if (!user) {
                console.log('User not found:', email);
                return res.status(400).json({ message: "Invalid email or password" });
            }
            console.log('User found:', user.email, 'Status:', user.status);

            // 1. Email verification check (Must be verified with real OTP)
            if (!user.email_verified) {
                console.log('Email not verified yet');
                return res.status(403).json({
                    message: "Please verify your email address first"
                });
            }
            console.log('Email is verified');

            // 2. Status checks (Real verified user)
            // A) Agar REJECTED hai -> direct RequestStatusScreen (no dashboard, no token)
            if (user.status === "rejected") {
                console.log('Account was rejected -> redirect to request status');
                return res.status(200).json({
                    status: "rejected",
                    message: "Your account has been rejected. Please contact admin.",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        department: user.department
                    }
                });
            }

            // B) Agar PENDING hai -> direct RequestStatusScreen (no dashboard, no token)
            if (user.status === "pending") {
                console.log('Account is pending approval -> redirect to request status');
                return res.status(200).json({
                    status: "pending",
                    message: "Your account is pending admin approval",
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        department: user.department
                    }
                });
            }

            // 3. Agar APPROVED hai -> Password verification (Dashboard access ke liye password zaroori hai)
            console.log('Verifying password for approved user...');
            const isMatch = await bcrypt.compare(password, user.password);      
            if (!isMatch) {
                console.log('Password does not match');
                return res.status(400).json({ message: "Invalid email or password" });
            }
            console.log('Password matched for approved user');
            console.log('Account is approved');
            console.log('Generating JWT token...');
            const token = jwt.sign(
                { user_id: user.id, role: user.role },
                process.env.JWT_SECRET
            );
            console.log('Token generated');
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department
            };
            console.log('LOGIN SUCCESSFUL');
            console.log('User Data:', userData);
            res.status(200).json({
                status: "approved",
                message: "Login successful",
                token,
                user: userData
            });
        } catch (error) {
            console.log('LOGIN ERROR:', error.message);
            console.log('Stack:', error.stack);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    profile(req, res) {
        console.log('\n========== PROFILE REQUEST ==========');
        console.log('User from token:', req.user);
        res.status(200).json({
            message: "Profile loaded",
            user: req.user
        });
    }
    async forgotPassword(req, res) {
        console.log('\n========== FORGOT PASSWORD REQUEST ==========');
        console.log('Request Body:', req.body);
        try {
            const { email } = req.body;
            if (!email) {
                console.log('Validation Failed: Missing email');
                return res.status(400).json({ message: "Email is required" });
            }
            const user = await authModel.findUserByEmail(email);
            if (!user) {
                console.log('User not found (but not revealing for security)');
                return res.json({
                    message: "If the email is registered, an OTP has been sent"
                });
            }
            console.log('User found');
            if (!user.email_verified) {
                console.log('Email not verified');
                return res.status(403).json({
                    message: "Please verify your email before requesting a password reset"
                });
            }
            console.log('Email is verified');
            console.log('Generating 4-digit OTP for password reset...');
            const otp = Math.floor(1000 + Math.random() * 9000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            await authModel.createResetToken(email, otp, expiresAt);
            
            console.log('Sending reset OTP email...');
            try {
                await emailService.sendOTPEmail(email, otp);
            } catch (mailError) {
                console.error('❌ Failed to send reset OTP email to:', email, mailError.message);
                return res.status(500).json({
                    message: "Failed to send password reset email. " + mailError.message,
                    error: mailError.message
                });
            }

            console.log('Reset OTP email sent successfully');
            console.log('FORGOT PASSWORD SUCCESSFUL');
            res.json({
                message: "Password reset OTP has been sent to your email"
            });
        } catch (error) {
            console.log('FORGOT PASSWORD ERROR:', error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async resetPassword(req, res) {
        console.log('\n========== RESET PASSWORD REQUEST ==========');
        console.log('Request Body:', { email: req.body.email, otp: req.body.otp, newPassword: '***' });
        try {
            const { email, otp, newPassword } = req.body;
            if (!email || !otp || !newPassword) {
                console.log('Validation Failed: Missing email, otp, or password');
                return res.status(400).json({ message: "Email, OTP, and new password are required" });
            }
            if (newPassword.length < 6) {
                console.log('Password too short');
                return res.status(400).json({ message: "Password must be at least 6 characters" });
            }
            console.log('Validation Passed');
            console.log('Verifying reset OTP...');
            const resetRecord = await authModel.findValidResetToken(otp);
            if (!resetRecord || resetRecord.email !== email) {
                console.log('Invalid or expired reset OTP');
                return res.status(400).json({ message: "Invalid or expired OTP" });
            }
            console.log('Reset OTP is valid');
            console.log('Hashing new password...');
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            console.log('Password hashed');
            console.log('Updating password in database...');
            await authModel.updatePassword(resetRecord.email, hashedPassword);
            console.log('Password updated');
            console.log('Marking OTP as used...');
            await authModel.markResetTokenUsed(otp);
            console.log('Reset OTP marked as used');
            console.log('RESET PASSWORD SUCCESSFUL');
            res.json({
                message: "Password has been reset successfully. You can now login with your new password."
            });

        } catch (error) {
            console.log('RESET PASSWORD ERROR:', error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // ✅ Real-time status check for RequestStatusScreen
    async checkStatus(req, res) {
        try {
            const email = req.query.email || req.body.email;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }
            const user = await authModel.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            if (!user.email_verified) {
                return res.status(403).json({ message: "Please verify your email address first" });
            }
            return res.status(200).json({
                status: user.status, // 'pending', 'approved', 'rejected'
                role: user.role,
                name: user.name,
                email: user.email,
                department: user.department
            });
        } catch (error) {
            console.log('CHECK STATUS ERROR:', error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}
module.exports = new AuthController();