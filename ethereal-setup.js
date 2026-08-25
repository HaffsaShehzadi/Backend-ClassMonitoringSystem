const nodemailer = require("nodemailer");

async function setupEthereal() {
    try {
        // Naya test account banao
        const testAccount = await nodemailer.createTestAccount();
        
        console.log("✅ Ethereal Account Created!");
        console.log("=".repeat(50));
        console.log("📧 Email:", testAccount.user);
        console.log("🔑 Password:", testAccount.pass);
        console.log("🌐 SMTP Host:", testAccount.smtp.host);
        console.log("🔌 SMTP Port:", testAccount.smtp.port);
        console.log("=".repeat(50));
        console.log("\n⚠️ Ye credentials .env mein paste karo!");
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

setupEthereal();