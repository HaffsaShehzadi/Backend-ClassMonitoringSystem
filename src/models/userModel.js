const db = require("../../Database");

// User Model - users table ka data handle karta hai
class UserModel {

    // ============================================
    // EXISTING METHODS (aapka original code - unchanged)
    // ============================================

    // Naya user register karna
    // status 'pending' rakha taa ke admin approve kare
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
        return result.insertId;   // naye user ki id wapas dena
    }

    // Email se user dhundo (department name ke saath)
    // LEFT JOIN: taa ke department ka naam bhi result mein aaye
    async findUserByEmail(email) {
        const sql = `
            SELECT u.*, d.dept_name AS department
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.email = ?
        `;
        const [rows] = await db.promise().query(sql, [email]);
        return rows[0];   // pehla user return karo
    }

    // Department name se id lana
    // Agar department naya hai to pehle bana dena
    async getOrCreateDepartment(deptName) {
        // Pehle check karo pehle se hai ya nahi
        const [rows] = await db.promise().query(
            "SELECT id FROM departments WHERE dept_name = ?",
            [deptName]
        );
        if (rows.length > 0) return rows[0].id;

        // Nahi hai to naya bana do
        const [result] = await db.promise().query(
            "INSERT INTO departments (dept_name) VALUES (?)",
            [deptName]
        );
        return result.insertId;
    }

    // ============================================
    // ⭐ NAYE METHODS - Email Verification + Password Reset
    // ============================================

    // Email verified mark karna (signup ke baad link click pe)
    async verifyEmail(email) {
        const sql = `UPDATE users SET email_verified = 1 WHERE email = ?`;
        await db.promise().query(sql, [email]);
    }

    // Auth controller ke liye wrapper (same as findUserByEmail)
    // Taa ke controller mein dono naam use ho sakein
    async findByEmail(email) {
        return await this.findUserByEmail(email);
    }

    // Password reset token save karna (forgot password pe)
    async createResetToken(email, token, expiresAt) {
        const sql = `
            INSERT INTO password_resets (email, token, expires_at)
            VALUES (?, ?, ?)
        `;
        await db.promise().query(sql, [email, token, expiresAt]);
    }

    // Valid reset token dhundo (unused + not expired)
    async findValidResetToken(token) {
        const sql = `
            SELECT * FROM password_resets
            WHERE token = ?
              AND used = 0
              AND expires_at > NOW()
            LIMIT 1
        `;
        const [rows] = await db.promise().query(sql, [token]);
        return rows[0];   // valid record ya undefined
    }

    // User ka password update karna (reset ke baad)
    async updatePassword(email, hashedPassword) {
        const sql = `UPDATE users SET password = ? WHERE email = ?`;
        await db.promise().query(sql, [hashedPassword, email]);
    }

    // Reset token ko used mark karna (dobara use na ho)
    async markResetTokenUsed(token) {
        const sql = `UPDATE password_resets SET used = 1 WHERE token = ?`;
        await db.promise().query(sql, [token]);
    }
}

module.exports = new UserModel();