const db = require("../../Database");

class DashboardModel {
    async getAdminDashboard() {
        // Ek hi query mein 6 alag alag counts nikalna (Subqueries)
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
        return rows[0]; // Pehli aur akeli row return karein jisme saare counts hain
    }
}
module.exports = new DashboardModel();