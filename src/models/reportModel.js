const db = require("../../Database");

// Report Model - handles attendance and performance reports
class ReportModel {

    // Get today's attendance records
    async getDailyAttendance() {
        const sql = `
            SELECT 
                a.id AS attendance_id,
                u.name AS teacher_name,
                mo.name AS monitor_name,
                d.dept_name AS department_name,
                a.status,
                a.location_verified,
                a.time_verified,
                a.marked_at
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            JOIN users mo ON a.marked_by = mo.id
            JOIN departments d ON t.department_id = d.id
            WHERE a.date = CURDATE()
            ORDER BY a.marked_at DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }

    // Get this week's attendance records
    async getWeeklyAttendance() {
        const sql = `
            SELECT 
                a.id AS attendance_id,
                u.name AS teacher_name,
                mo.name AS monitor_name,
                d.dept_name AS department_name,
                a.status,
                a.location_verified,
                a.time_verified,
                a.marked_at
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            JOIN users mo ON a.marked_by = mo.id
            JOIN departments d ON t.department_id = d.id
            WHERE YEARWEEK(a.date, 1) = YEARWEEK(CURDATE(), 1)
            ORDER BY a.marked_at DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }

    // Get this month's attendance records
    async getMonthlyAttendance() {
        const sql = `
            SELECT 
                a.id AS attendance_id,
                u.name AS teacher_name,
                mo.name AS monitor_name,
                d.dept_name AS department_name,
                a.status,
                a.location_verified,
                a.time_verified,
                a.marked_at
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            JOIN users mo ON a.marked_by = mo.id
            JOIN departments d ON t.department_id = d.id
            WHERE MONTH(a.date) = MONTH(CURDATE())
              AND YEAR(a.date) = YEAR(CURDATE())
            ORDER BY a.marked_at DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }

    // Get attendance by department
    async getDepartmentAttendance(departmentId) {
        const sql = `
            SELECT 
                a.id AS attendance_id,
                u.name AS teacher_name,
                mo.name AS monitor_name,
                d.dept_name AS department_name,
                a.status,
                a.location_verified,
                a.time_verified,
                a.marked_at
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            JOIN users mo ON a.marked_by = mo.id
            JOIN departments d ON t.department_id = d.id
            WHERE t.department_id = ?
            ORDER BY a.marked_at DESC
        `;
        const [rows] = await db.promise().query(sql, [departmentId]);
        return rows;
    }

    // Get specific teacher's attendance history
    async getTeacherAttendance(teacherId) {
        const sql = `
            SELECT 
                a.id AS attendance_id,
                u.name AS teacher_name,
                mo.name AS monitor_name,
                d.dept_name AS department_name,
                a.status,
                a.location_verified,
                a.time_verified,
                a.marked_at
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            JOIN users mo ON a.marked_by = mo.id
            JOIN departments d ON t.department_id = d.id
            WHERE t.teacher_id = ?
            ORDER BY a.marked_at DESC
        `;
        const [rows] = await db.promise().query(sql, [teacherId]);
        return rows;
    }

    // Attendance summary statistics
    async getAttendanceSummary() {
        const sql = `
            SELECT 
                COUNT(*) AS total_records,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_count,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_count,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late_count,
                SUM(CASE WHEN location_verified = 1 THEN 1 ELSE 0 END) AS verified_count,
                ROUND(
                    (SUM(CASE WHEN location_verified = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 
                    2
                ) AS verification_rate
            FROM attendance
        `;
        const [rows] = await db.promise().query(sql);
        return rows[0];
    }
}

module.exports = new ReportModel();