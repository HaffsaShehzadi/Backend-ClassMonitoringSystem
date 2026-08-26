// Email Service - handles email sending
class EmailService {

    // Email bhejne ka common function
    async sendEmail(to, subject, html) {
        try {
            console.log("\n" + "=".repeat(60));
            console.log("📧 EMAIL SENT");
            console.log("=".repeat(60));
            console.log("To:", to);
            console.log("Subject:", subject);
            console.log("-".repeat(60));

            // HTML se links nikalo (verification/reset URLs)
            const linkMatches = html.match(/href="([^"]+)"/g);
            if (linkMatches) {
                console.log("\n🔗 LINKS IN EMAIL:");
                linkMatches.forEach(match => {
                    const url = match.replace('href="', '').replace('"', '');
                    console.log("   " + url);
                });
            }

            console.log("=".repeat(60) + "\n");

            return { success: true };
        } catch (error) {
            console.error("Email send error:", error.message);
            return { success: false, error: error.message };
        }
    }

    // Verification email (signup ke baad)
    async sendVerificationEmail(email, token) {
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

        const html = `
            <h2>Welcome to Class Monitoring System!</h2>
            <p>Your account has been created successfully.</p>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>Or copy and paste this URL into your browser:</p>
            <p><code>${verifyUrl}</code></p>
            <p><small>This link is valid for 24 hours.</small></p>
        `;

        return await this.sendEmail(email, "Verify Your Email", html);
    }

    // Password reset email
    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        const html = `
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password.</p>
            <p>Click the link below to set a new password:</p>
            <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>Or copy and paste this URL into your browser:</p>
            <p><code>${resetUrl}</code></p>
            <p><small>This link is valid for 1 hour.</small></p>
            <p><small>If you did not request a password reset, please ignore this email.</small></p>
        `;

        return await this.sendEmail(email, "Reset Your Password", html);
    }
}

module.exports = new EmailService();