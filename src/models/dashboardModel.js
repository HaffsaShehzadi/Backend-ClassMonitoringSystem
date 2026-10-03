const db = require("../../Database");

class DashboardModel {
    async getAdminDashboard() {
       
        const sql = `
            SELECT
                (SELECT COUNT(*) FROM users WHERE role = 'teacher' AND status = 'approved') AS total_teachers,
                (SELECT COUNT(*) FROM users WHERE role = 'monitoring' AND status = 'approved') AS total_monitors,
                (SELECT COUNT(*) FROM departments) AS total_departments,
                (SELECT COUNT(*) FROM rooms) AS total_rooms,
                (SELECT COUNT(*) FROM users WHERE status = 'pending' AND email_verified = 1) AS pending_approvals,
                (SELECT COUNT(*) FROM complaints WHERE status = 'pending') AS pending_complaints
        `;    
        const [rows] = await db.promise().query(sql);
        return rows[0]; 
    }

    async getPendingUsers() {
        const sql = `
            SELECT u.*, d.dept_name AS department
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.status = 'pending' AND u.email_verified = 1
            ORDER BY u.join_date DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }

    async approveUser(userId) {
        const sql = `UPDATE users SET status = 'approved' WHERE id = ?`;
        await db.promise().query(sql, [userId]);
    }

    async rejectUser(userId) {
        const sql = `UPDATE users SET status = 'rejected' WHERE id = ?`;
        await db.promise().query(sql, [userId]);
    }

    async getRejectedUsers() {
        const sql = `
            SELECT u.*, d.dept_name AS department
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.status = 'rejected' AND u.email_verified = 1
            ORDER BY u.join_date DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }
    async deleteRejectedUser(userId) {
        const userModel = require("./userModel");
        await userModel.deleteUser(userId);
    }
}
module.exports = new DashboardModel();