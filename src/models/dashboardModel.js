const db = require("../../Database");

// ============================================
// Dashboard Model - admin dashboard ke counts
// + teacher approval system
// ============================================
class DashboardModel {

    // Admin dashboard ke COUNTS (frontend cards ke liye)
    async getAdminDashboard() {
        const sql = `
            SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'teacher') AS total_teachers,
            (SELECT COUNT(*) FROM users WHERE role = 'monitoring') AS total_monitors,
            (SELECT COUNT(*) FROM departments) AS total_departments,
            (SELECT COUNT(*) FROM rooms) AS total_rooms,
            (SELECT COUNT(*) FROM users WHERE status = 'pending') AS pending_approvals,
            (SELECT COUNT(*) FROM complaints WHERE status = 'pending') AS pending_complaints,
            (SELECT COUNT(*) FROM attendance WHERE DATE(marked_at) = CURDATE()) AS today_attendance,
            (SELECT COUNT(*) FROM attendance WHERE location_verified = 1 AND DATE(marked_at) = CURDATE()) AS valid_attendance,
            (SELECT COUNT(*) FROM attendance WHERE location_verified = 0 AND DATE(marked_at) = CURDATE()) AS invalid_attendance
        `;
        const [rows] = await db.promise().query(sql);
        return rows[0];   // ek hi row aati hai (saare counts)
    }

    // Pending teachers ki LIST (approval screen ke liye)
    async getPendingUsers() {
        const sql = `
            SELECT u.*, d.dept_name AS department
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.status = 'pending'
            ORDER BY u.join_date DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }

    // Admin teacher ko APPROVE karta hai
    async approveUser(userId) {
        const sql = `UPDATE users SET status = 'approved' WHERE id = ?`;
        await db.promise().query(sql, [userId]);
    }

    // Admin teacher ko REJECT karta hai
    async rejectUser(userId) {
        const sql = `UPDATE users SET status = 'rejected' WHERE id = ?`;
        await db.promise().query(sql, [userId]);
    }
}

module.exports = new DashboardModel();