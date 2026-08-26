// Email Service - Development version
// Emails console mein print hongi + preview URL
// Production mein SMTP add kar denge
class EmailService {

    // Email bhejne ka common function
    // Development: console mein print karega
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
            <h2>Welcome to Class Monitoring System! 🎓</h2>
            <p>account created successfully.</p>
            <p>For email verification click here:</p>
            <a href="${verifyUrl}">Verify Email</a>
            <p>copy URL:</p>
            <p><code>${verifyUrl}</code></p>
            <p><small>Link is valid for 24 hours.</small></p>
        `;

        return await this.sendEmail(email, "Verify Your Email", html);
    }

    // Password reset email
    async sendPasswordResetEmail(email, token) {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

        const html = `
            <h2>Password Reset Request 🔑</h2>
            <p>Aapne password reset ka request kiya hai.</p>
            <p>Naya password set karne ke liye link click karein:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>Ya ye URL copy karein:</p>
            <p><code>${resetUrl}</code></p>
            <p><small>Ye link 1 ghante tak valid hai.</small></p>
            <p><small>Agar aapne request nahi kiya, to ye email ignore karein.</small></p>
        `;

        return await this.sendEmail(email, "Reset Your Password", html);
    }
}

module.exports = new EmailService();