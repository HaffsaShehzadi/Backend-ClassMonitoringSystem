const db = require("../../Database");

class ReportModel {

    getDailyAttendance(callback) {

        const sql = `
            SELECT

            a.attendance_id,

            t.full_name
            AS teacher_name,

            m.full_name
            AS monitor_name,

            d.department_name,

            a.status,

            a.validation_status,

            a.marked_at

            FROM attendance a

            JOIN users t
            ON a.teacher_id = t.user_id

            JOIN users m
            ON a.monitor_id = m.user_id

            JOIN timetable tt
            ON a.timetable_id = tt.timetable_id

            JOIN departments d
            ON tt.department_id = d.department_id

            WHERE DATE(a.marked_at)=CURDATE()

            ORDER BY a.marked_at DESC
        `;

        db.query(sql, callback);

    }

}

module.exports = new ReportModel();