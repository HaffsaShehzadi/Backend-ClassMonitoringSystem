const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const authModel = require("../models/authModel");
const emailService = require("../services/emailService");

class AuthController {

    // ==================== SIGNUP ====================
    async signup(req, res) {
        console.log('\n========== SIGNUP REQUEST ==========');
        console.log('Request Body:', req.body);
        
        try {
            const { name, email, password, role, department } = req.body;

            if (!name || !email || !password || !role) {
                console.log('Validation Failed: Missing fields');
                return res.status(400).json({ message: "All fields are required" });
            }
            console.log('Validation Passed');

            console.log('Checking if user exists:', email);
            const existing = await authModel.findUserByEmail(email);
            if (existing) {
                console.log('User already exists:', email);
                return res.status(400).json({ message: "Email already exists" });
            }
            console.log('User does not exist - can proceed');

            console.log('Hashing password...');
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log('Password hashed');

            let departmentId = null;
            if (department) {
                console.log('Getting/Creating department:', department);
                departmentId = await authModel.getOrCreateDepartment(department);
                console.log('Department ID:', departmentId);
            }

            console.log('Creating user in database...');
            const userId = await authModel.createUser({
                name,
                email,
                password: hashedPassword,
                role,
                departmentId
            });
            console.log('User created with ID:', userId);

            console.log('Generating OTP...');
            const otp = await authModel.createOTP(email);
            console.log('OTP Generated:', otp);

            // ✅ NEW: REAL EMAIL SEND - OTP email bhejna
            console.log('Sending OTP email...');
            await emailService.sendOTPEmail(email, otp);
            console.log('✅ OTP email sent successfully to:', email);

            console.log('SIGNUP SUCCESSFUL');
            res.status(201).json({
                message: "Signup successful! OTP sent to your email",
                demo_otp: otp // Testing ke liye - production mein hata dein
            });

        } catch (error) {
            console.log('SIGNUP ERROR:', error.message);
            console.log('Stack:', error.stack);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // ==================== VERIFY OTP ====================
    async verifyOTP(req, res) {
        console.log('\n========== VERIFY OTP REQUEST ==========');
        console.log('Request Body:', req.body);

        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                console.log('Validation Failed: Missing email or OTP');
                return res.status(400).json({ message: "Email and OTP are required" });
            }
            console.log('Validation Passed');

            console.log('Verifying OTP in database...');
            const isValid = await authModel.verifyOTP(email, otp);

            if (!isValid) {
                console.log('Invalid or expired OTP');
                return res.status(400).json({ 
                    message: "Invalid or expired OTP. Please try again." 
                });
            }
            console.log('OTP is valid');

            console.log('Marking email as verified...');
            await authModel.verifyEmail(email);
            console.log('Email verified successfully');

            console.log('OTP VERIFICATION SUCCESSFUL');
            res.json({
                message: "Email verified successfully. Please wait for admin approval."
            });

        } catch (error) {
            console.log('VERIFY OTP ERROR:', error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // ==================== RESEND OTP ====================
    async resendOTP(req, res) {
        console.log('\n========== RESEND OTP REQUEST ==========');
        console.log('Request Body:', req.body);

        try {
            const { email } = req.body;

            if (!email) {
                console.log('Validation Failed: Missing email');
                return res.status(400).json({ message: "Email is required" });
            }
            console.log('Validation Passed');

            console.log('Checking if user exists:', email);
            const user = await authModel.findUserByEmail(email);
            if (!user) {
                console.log('User not found:', email);
                return res.status(404).json({ message: "User not found" });
            }
            console.log('User found');

            console.log('Generating new OTP...');
            const otp = await authModel.createOTP(email);
            console.log('New OTP Generated:', otp);

            // ✅ NEW: REAL EMAIL SEND - Resend OTP email
            console.log('Sending OTP email...');
            await emailService.sendOTPEmail(email, otp);
            console.log('✅ OTP email resent successfully to:', email);

            console.log('RESEND OTP SUCCESSFUL');
            res.json({
                message: "OTP sent successfully",
                demo_otp: otp // Testing ke liye
            });

        } catch (error) {
            console.log('RESEND OTP ERROR:', error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // ==================== LOGIN ====================
    async login(req, res) {
        console.log('\n========== LOGIN REQUEST ==========');
        console.log('Request Body:', { email: req.body.email, password: '***' });

        try {
            const { email, password } = req.body;

            console.log('Searching for user:', email);
            const user = await authModel.findUserByEmail(email);
            
            if (!user) {
                console.log('User not found:', email);
                return res.status(400).json({ message: "Invalid email or password" });
            }
            console.log('User found:', user.email);

            console.log('Verifying password...');
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                console.log('Password does not match');
                return res.status(400).json({ message: "Invalid email or password" });
            }
            console.log('Password matched');

            if (!user.email_verified) {
                console.log('Email not verified yet');
                return res.status(403).json({
                    message: "Please verify your email address first"
                });
            }
            console.log('Email is verified');

            console.log('Checking account status:', user.status);
            if (user.status === "pending") {
                console.log('Account is pending approval');
                return res.status(200).json({
                    status: "pending",
                    message: "Your account is pending admin approval"
                });
            }
            if (user.status === "rejected") {
                console.log('Account was rejected');
                return res.status(403).json({
                    status: "rejected",
                    message: "Your account has been rejected. Please contact admin."
                });
            }
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

    // ==================== PROFILE ====================
    profile(req, res) {
        console.log('\n========== PROFILE REQUEST ==========');
        console.log('User from token:', req.user);
        
        res.status(200).json({
            message: "Profile loaded",
            user: req.user
        });
    }

    // ==================== FORGOT PASSWORD ====================
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
                    message: "If the email is registered, a reset link has been sent"
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

            console.log('Generating password reset token...');
            const resetToken = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await authModel.createResetToken(email, resetToken, expiresAt);
            console.log('Reset token created');

            console.log('Sending reset email...');
            await emailService.sendPasswordResetEmail(email, resetToken);
            console.log('Reset email sent');

            console.log('FORGOT PASSWORD SUCCESSFUL');
            res.json({
                message: "Password reset link has been sent to your email"
            });

        } catch (error) {
            console.log('FORGOT PASSWORD ERROR:', error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // ==================== RESET PASSWORD ====================
    async resetPassword(req, res) {
        console.log('\n========== RESET PASSWORD REQUEST ==========');
        console.log('Request Body:', { token: req.body.token, newPassword: '***' });

        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                console.log('Validation Failed: Missing token or password');
                return res.status(400).json({ message: "Token and new password are required" });
            }

            if (newPassword.length < 6) {
                console.log('Password too short');
                return res.status(400).json({ message: "Password must be at least 6 characters" });
            }
            console.log('Validation Passed');

            console.log('Verifying reset token...');
            const resetRecord = await authModel.findValidResetToken(token);
            
            if (!resetRecord) {
                console.log('Invalid or expired reset token');
                return res.status(400).json({ message: "Invalid or expired reset link" });
            }
            console.log('Reset token is valid');

            console.log('Hashing new password...');
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            console.log('Password hashed');

            console.log('Updating password in database...');
            await authModel.updatePassword(resetRecord.email, hashedPassword);
            console.log('Password updated');

            console.log('Marking token as used...');
            await authModel.markResetTokenUsed(token);
            console.log('Reset token marked as used');

            console.log('RESET PASSWORD SUCCESSFUL');
            res.json({
                message: "Password has been reset successfully. You can now login with your new password."
            });

        } catch (error) {
            console.log('RESET PASSWORD ERROR:', error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new AuthController();