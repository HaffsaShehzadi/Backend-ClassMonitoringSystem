const db = require("../../Database");

class DashboardModel {

    getAdminDashboard(callback) {

        const sql = `
            SELECT

            (SELECT COUNT(*) FROM users
            WHERE role = 'teacher')
            AS total_teachers,

            (SELECT COUNT(*) FROM users
            WHERE role = 'monitor')
            AS total_monitors,

            (SELECT COUNT(*) FROM departments)
            AS total_departments,

            (SELECT COUNT(*) FROM rooms)
            AS total_rooms,

            (SELECT COUNT(*)
            FROM attendance
            WHERE DATE(marked_at)=CURDATE())
            AS today_attendance,

            (SELECT COUNT(*)
            FROM attendance
            WHERE validation_status='Valid'
            AND DATE(marked_at)=CURDATE())
            AS valid_attendance,

            (SELECT COUNT(*)
            FROM attendance
            WHERE validation_status='Invalid'
            AND DATE(marked_at)=CURDATE())
            AS invalid_attendance
        `;

        db.query(sql, callback);

    }

}

module.exports = new DashboardModel();