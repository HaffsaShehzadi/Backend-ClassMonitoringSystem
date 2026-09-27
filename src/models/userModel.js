const db = require("../../Database");

// ✅ Class ka naam UserModel rakha hai (Admin features ke liye)
class UserModel {

    // 1. Admin: Saare approved Teachers aur MOs ki list lana
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
        
        // Frontend ke mutabiq data format karna
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            role: row.role === 'teacher' ? 'Teacher' : 'Monitoring Official',
            department: row.department || 'N/A',
            joinDate: row.joinDate || 'N/A'
        }));
    }

    // 2. Admin: Pending users ki list lana (Approval ke liye)
    async getPendingUsers() {
        const sql = `
            SELECT id, name, email, role, dept_name AS department, join_date
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.status = 'pending' AND u.email_verified = 1
            ORDER BY join_date DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }

    // 3. Admin: User ko approve ya reject karna
    async updateUserStatus(userId, status) {
        const sql = `UPDATE users SET status = ? WHERE id = ?`;
        await db.promise().query(sql, [status, userId]);
    }

    // 4. Admin: User ko delete karna (FK references ko pehle clean up karein)
    async deleteUser(userId) {
        const [users] = await db.promise().query('SELECT email FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return;
        const email = users[0].email;

        try {
            await db.promise().query('START TRANSACTION');

            // 1. Delete user_otps & password_resets
            await db.promise().query('DELETE FROM user_otps WHERE email = ?', [email]);
            await db.promise().query('DELETE FROM password_resets WHERE email = ?', [email]);

            // 2. Delete live locations
            await db.promise().query('DELETE FROM live_locations WHERE user_id = ?', [userId]);

            // 3. Delete complaints
            await db.promise().query('DELETE FROM complaints WHERE teacher_id = ?', [userId]);

            // 4. Delete duty assignments
            await db.promise().query('DELETE FROM duty_assignments WHERE official_id = ? OR assigned_by = ?', [userId, userId]);

            // 5. Delete attendance marked by this user
            await db.promise().query('DELETE FROM attendance WHERE marked_by = ?', [userId]);

            // 6. Delete attendance for timetable entries of this teacher
            await db.promise().query('DELETE FROM attendance WHERE timetable_id IN (SELECT id FROM timetable WHERE teacher_id = ?)', [userId]);

            // 7. Delete timetable entries
            await db.promise().query('DELETE FROM timetable WHERE teacher_id = ?', [userId]);

            // 8. Delete user
            await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);

            await db.promise().query('COMMIT');
        } catch (error) {
            await db.promise().query('ROLLBACK');
            throw error;
        }
    }
}

module.exports = new UserModel();