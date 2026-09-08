const db = require("../../Database");

// User Model - Admin User Management ke liye
class UserModel {

    // Admin: Saare approved Teachers aur MOs ki list lana
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
            department: row.department || '-',
            joinDate: row.joinDate || 'N/A'
        }));
    }

    // Admin: User ko delete karna
    async deleteUser(userId) {
        const sql = `DELETE FROM users WHERE id = ?`;
        await db.promise().query(sql, [userId]);
    }
}

module.exports = new UserModel();