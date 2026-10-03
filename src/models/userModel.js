const db = require("../../Database");

class UserModel {
    async getAllUsers() {
        const sql = `
            SELECT 
                u.id, 
                u.name, 
                u.role, 
                d.dept_name AS department, 
                DATE(u.join_date) AS joinDate
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.role IN ('teacher', 'monitoring') AND u.status = 'approved'
            ORDER BY u.join_date DESC
        `;
        const [rows] = await db.promise().query(sql);
        
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            role: row.role === 'teacher' ? 'Teacher' : 'Monitoring Official',
            department: row.department || 'N/A',
            joinDate: row.joinDate || 'N/A'
        }));
    }
    async getPendingUsers() {
        const sql = `
            SELECT u.id, u.name, u.email, u.role, d.dept_name AS department, DATE(u.join_date) AS joinDate
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.status = 'pending' AND u.email_verified = 1
            ORDER BY u.join_date DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }
    async updateUserStatus(userId, status) {

        const validStatuses = ['approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new Error("Invalid status provided");
        }
        const sql = `UPDATE users SET status = ? WHERE id = ?`;
        await db.promise().query(sql, [status, userId]);
    }

    async deleteUser(userId) {
      
        const [users] = await db.promise().query('SELECT email FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            throw new Error("User not found");
        }
        const email = users[0].email;
        try {
            await db.promise().query('START TRANSACTION');

            await db.promise().query('DELETE FROM user_otps WHERE email = ?', [email]);
            await db.promise().query('DELETE FROM password_resets WHERE email = ?', [email]);

            await db.promise().query('DELETE FROM live_locations WHERE user_id = ?', [userId]);

            await db.promise().query('DELETE FROM complaints WHERE teacher_id = ?', [userId]);

            await db.promise().query('DELETE FROM duty_assignments WHERE official_id = ? OR assigned_by = ?', [userId, userId]);

            await db.promise().query('DELETE FROM attendance WHERE marked_by = ?', [userId]);

            await db.promise().query('DELETE FROM attendance WHERE timetable_id IN (SELECT id FROM timetable WHERE teacher_id = ?)', [userId]);

            await db.promise().query('DELETE FROM timetable WHERE teacher_id = ?', [userId]);

            await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);

            await db.promise().query('COMMIT');
        } catch (error) { 
            await db.promise().query('ROLLBACK');
            throw error;
        }
    }
}
module.exports = new UserModel();