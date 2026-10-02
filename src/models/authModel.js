const db = require("../../Database");

// ✅ Class ka naam AuthModel rakha hai taake confusion na ho
class AuthModel {

    // 1. Naya user register karna
    async createUser(userData) {
        const sql = `
            INSERT INTO users (name, email, password, role, department_id, status, email_verified, join_date)
            VALUES (?, ?, ?, ?, ?, 'pending', 0, CURDATE())
        `;
        const [result] = await db.promise().query(sql, [
            userData.name,
            userData.email,
            userData.password,
            userData.role,
            userData.departmentId
        ]);
        return result.insertId;
    }

    // 1b. Agar pehle se unverified user ho toh naye details ke sath update karna
    async updateUnverifiedUser(userData) {
        const sql = `
            UPDATE users 
            SET name = ?, password = ?, role = ?, department_id = ?, status = 'pending'
            WHERE email = ? AND (email_verified = 0 OR email_verified IS NULL)
        `;
        await db.promise().query(sql, [
            userData.name,
            userData.password,
            userData.role,
            userData.departmentId,
            userData.email
        ]);
    }

    // 2. Email se user dhundo (department name ke saath)
    async findUserByEmail(email) {
        const sql = `
            SELECT u.*, d.dept_name AS department
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.email = ?
        `;
        const [rows] = await db.promise().query(sql, [email]);
        return rows[0];
    }

    // Department ID fetch karne ke liye
    async getDepartmentId(deptName) {
        if (!deptName) return null;
        
        const [rows] = await db.promise().query(
            "SELECT id FROM departments WHERE dept_name = ?",
            [deptName]
        );
        
        // Agar department mila toh ID return karo, warna null
        if (rows.length > 0) {
            return rows[0].id;
        }
        return null; 
    }

    // 4. Email verified mark karna
    async verifyEmail(email) {
        const sql = `UPDATE users SET email_verified = 1 WHERE email = ?`;
        await db.promise().query(sql, [email]);
    }

    // 5. Password reset token save karna
    async createResetToken(email, token, expiresAt) {
        const sql = `INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)`;
        await db.promise().query(sql, [email, token, expiresAt]);
    }

    // 6. Valid reset token dhundo
    async findValidResetToken(token) {
        const sql = `
            SELECT * FROM password_resets
            WHERE token = ? AND used = 0 AND expires_at > NOW()
            LIMIT 1
        `;
        const [rows] = await db.promise().query(sql, [token]);
        return rows[0];
    }

    // 7. User ka password update karna
    async updatePassword(email, hashedPassword) {
        const sql = `UPDATE users SET password = ? WHERE email = ?`;
        await db.promise().query(sql, [hashedPassword, email]);
    }

    // 8. Reset token ko used mark karna
    async markResetTokenUsed(token) {
        const sql = `UPDATE password_resets SET used = 1 WHERE token = ?`;
        await db.promise().query(sql, [token]);
    }

    // 9. OTP create karna
    async createOTP(email) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const sql = `INSERT INTO user_otps (email, otp, expires_at, used) VALUES (?, ?, ?, 0)`;
        await db.promise().query(sql, [email, otp, expiresAt]);
        
        return otp;
    }

    // 10. OTP verify karna
    async verifyOTP(email, otp) {
        const sql = `
            SELECT id FROM user_otps
            WHERE email = ? AND otp = ? AND used = 0 AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        `;
        const [rows] = await db.promise().query(sql, [email, otp]);
        
        if (rows.length === 0) return false;

        // OTP ko used mark karein
        await this.markOTPAsUsed(rows[0].id);
        return true;
    }

    // 11. OTP ko used mark karna
    async markOTPAsUsed(otpId) {
        const sql = `UPDATE user_otps SET used = 1 WHERE id = ?`;
        await db.promise().query(sql, [otpId]);
    }
}

module.exports = new AuthModel();