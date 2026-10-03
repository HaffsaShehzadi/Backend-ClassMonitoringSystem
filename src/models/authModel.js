const db = require("../../Database");

class AuthModel {

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

    async getDepartmentId(deptName) {
        if (!deptName) return null;
        
        const [rows] = await db.promise().query(
            "SELECT id FROM departments WHERE dept_name = ?",
            [deptName]
        );
        
        if (rows.length > 0) {
            return rows[0].id;
        }
        return null; 
    }

    async verifyEmail(email) {
        const sql = `UPDATE users SET email_verified = 1 WHERE email = ?`;
        await db.promise().query(sql, [email]);
    }

    async createResetToken(email, token, expiresAt) {
        const sql = `INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)`;
        await db.promise().query(sql, [email, token, expiresAt]);
    }

    async findValidResetToken(token) {
        const sql = `
            SELECT * FROM password_resets
            WHERE token = ? AND used = 0 AND expires_at > NOW()
            LIMIT 1
        `;
        const [rows] = await db.promise().query(sql, [token]);
        return rows[0];
    }

    async updatePassword(email, hashedPassword) {
        const sql = `UPDATE users SET password = ? WHERE email = ?`;
        await db.promise().query(sql, [hashedPassword, email]);
    }

    async markResetTokenUsed(token) {
        const sql = `UPDATE password_resets SET used = 1 WHERE token = ?`;
        await db.promise().query(sql, [token]);
    }

    async createOTP(email) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const sql = `INSERT INTO user_otps (email, otp, expires_at, used) VALUES (?, ?, ?, 0)`;
        await db.promise().query(sql, [email, otp, expiresAt]);
        
        return otp;
    }

    async verifyOTP(email, otp) {
        const sql = `
            SELECT id FROM user_otps
            WHERE email = ? AND otp = ? AND used = 0 AND expires_at > NOW()
            ORDER BY created_at DESC LIMIT 1
        `;
        const [rows] = await db.promise().query(sql, [email, otp]);
        
        if (rows.length === 0) return false;

        await this.markOTPAsUsed(rows[0].id);
        return true;
    }

    async markOTPAsUsed(otpId) {
        const sql = `UPDATE user_otps SET used = 1 WHERE id = ?`;
        await db.promise().query(sql, [otpId]);
    }
}

module.exports = new AuthModel();