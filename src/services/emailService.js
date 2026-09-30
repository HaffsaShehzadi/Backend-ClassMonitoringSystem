const nodemailer = require("nodemailer");

class EmailService {
    constructor() {
        // Real Gmail SMTP Setup
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: process.env.SMTP_PORT || 587,
            secure: false, // 587 port ke liye false hota hai
            auth: {
                user: process.env.EMAIL_USER || process.env.SMTP_USER,
                pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
            },
        });
    }
    // Common email bhejne ka real function
    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_FROM || `"Class Monitoring System" <${process.env.SMTP_USER || process.env.EMAIL_USER}>`,
                to: to,
                subject: subject,
                html: html,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Real email sent successfully to: ${to}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`❌ Real email send failed to ${to}:`, error.message);
            throw error;
        }
    }

    // OTP Verification Email
    async sendOTPEmail(email, otp) {
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; text-align: center;">
                <h2 style="color: #1A237E;">Email Verification</h2>
                <p>Class Monitoring System,</p>
                <p>Your 4-digit verification code is:</p>
                <h1 style="color: #1A237E; letter-spacing: 5px; background: #f0f0f0; padding: 10px; border-radius: 5px;">${otp}</h1>
                <p style="color: #666; font-size: 12px;">This code will expire in 10 minutes.</p>
            </div>
        `;
        return await this.sendEmail(email, "Verify Your Email - Class Monitoring System", html);
    }

    // Password reset email
    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://169.58.9.166:8081'}/reset-password?token=${token}`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: #1A237E;">Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1A237E; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </div>
        `;
        return await this.sendEmail(email, "Reset Your Password", html);
    }
}

module.exports = new EmailService();