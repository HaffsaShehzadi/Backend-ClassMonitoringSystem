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
    getWeeklyAttendance(callback) {

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

        WHERE YEARWEEK(a.marked_at,1)=YEARWEEK(CURDATE(),1)

        ORDER BY a.marked_at DESC
    `;

    db.query(sql, callback);

}
getMonthlyAttendance(callback) {

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
        ON a.teacher_id=t.user_id

        JOIN users m
        ON a.monitor_id=m.user_id

        JOIN timetable tt
        ON a.timetable_id=tt.timetable_id

        JOIN departments d
        ON tt.department_id=d.department_id

        WHERE
        MONTH(a.marked_at)=MONTH(CURDATE())

        AND
        YEAR(a.marked_at)=YEAR(CURDATE())

        ORDER BY a.marked_at DESC
    `;

    db.query(sql,callback);

}
getDepartmentAttendance(department_id, callback) {

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

        WHERE d.department_id = ?

        ORDER BY a.marked_at DESC
    `;

    db.query(sql, [department_id], callback);

}
getTeacherAttendance(teacher_id, callback) {

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

        WHERE a.teacher_id = ?

        ORDER BY a.marked_at DESC
    `;

    db.query(sql, [teacher_id], callback);

}

}

module.exports = new ReportModel();