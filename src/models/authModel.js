const db = require("../../Database");

// User Model - users table ka data handle karta hai
class UserModel {

    // Naya user register karna
    async createUser(userData) {
        const sql = `
            INSERT INTO users
            (name, email, password, role, department_id, status, join_date)
            VALUES (?, ?, ?, ?, ?, 'pending', CURDATE())
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

    // Email se user dhundo (department name ke saath)
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

    // Department name se id lana
    async getOrCreateDepartment(deptName) {
        const [rows] = await db.promise().query(
            "SELECT id FROM departments WHERE dept_name = ?",
            [deptName]
        );
        if (rows.length > 0) return rows[0].id;

        const [result] = await db.promise().query(
            "INSERT INTO departments (dept_name) VALUES (?)",
            [deptName]
        );
        return result.insertId;
    }

    // Email verified mark karna
    async verifyEmail(email) {
        const sql = `UPDATE users SET email_verified = 1 WHERE email = ?`;
        await db.promise().query(sql, [email]);
    }

    // Password reset token save karna
    async createResetToken(email, token, expiresAt) {
        const sql = `
            INSERT INTO password_resets (email, token, expires_at)
            VALUES (?, ?, ?)
        `;
        await db.promise().query(sql, [email, token, expiresAt]);
    }

    // Valid reset token dhundo
    async findValidResetToken(token) {
        const sql = `
            SELECT * FROM password_resets
            WHERE token = ?
              AND used = 0
              AND expires_at > NOW()
            LIMIT 1
        `;
        const [rows] = await db.promise().query(sql, [token]);
        return rows[0];
    }

    // User ka password update karna
    async updatePassword(email, hashedPassword) {
        const sql = `UPDATE users SET password = ? WHERE email = ?`;
        await db.promise().query(sql, [hashedPassword, email]);
    }

    // Reset token ko used mark karna
    async markResetTokenUsed(token) {
        const sql = `UPDATE password_resets SET used = 1 WHERE token = ?`;
        await db.promise().query(sql, [token]);
    }

    // ==================== OTP METHODS (Aapki user_otps table ke mutabiq) ====================
    
    // OTP create karna (signup/resend ke time)
    async createOTP(email) {
        // ✅ 4-Digit OTP Generate karein (1000 se 9999 ke beech)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes baad expire

        // ✅ Aapki 'user_otps' table mein naya record insert karein
        const sql = `
            INSERT INTO user_otps (email, otp, expires_at, used)
            VALUES (?, ?, ?, 0)
        `;
        await db.promise().query(sql, [email, otp, expiresAt]);
        
        return otp;
    }

    // OTP verify karna
    async verifyOTP(email, otp) {
        // ✅ 'user_otps' table se check karein ke OTP valid, unused aur unexpired hai
        const sql = `
            SELECT * FROM user_otps
            WHERE email = ? AND otp = ? AND used = 0 AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
        `;
        const [rows] = await db.promise().query(sql, [email, otp]);
        
        if (rows.length === 0) {
            return false; // OTP galat hai, expire ho chuka hai, ya pehle use ho chuka hai
        }

        // ✅ OTP ko used mark karein (ID ke zariye, taake safe ho)
        await this.markOTPAsUsed(rows[0].id);
        return true;
    }

    // OTP ko used mark karna (dobara use na ho)
    async markOTPAsUsed(otpId) {
        const sql = `UPDATE user_otps SET used = 1 WHERE id = ?`;
        await db.promise().query(sql, [otpId]);
    }
}

module.exports = new UserModel();