const db = require("../../Database"); // Apne database config ke mutabiq path adjust karein

class ReportModel {

    // Get attendance by department (with date range)
    async getDepartmentAttendance(departmentId, startDate, endDate) {
        const sql = `
            SELECT 
                a.id, a.date, d.dept_name AS dept, t.semester AS sem, t.day, p.period_number AS period, 
                u.name AS teacher, t.subject_code AS code, r.room_no AS room, a.status, 
                a.substitute_teacher_name AS substitute, mo.name AS markedBy
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            JOIN users mo ON a.marked_by = mo.id
            JOIN departments d ON t.department_id = d.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            WHERE t.department_id = ? 
              AND a.date >= ? AND a.date <= ?
            ORDER BY a.date DESC, p.period_number ASC
        `;
        const [rows] = await db.promise().query(sql, [departmentId, startDate, endDate]);
        return rows;
    }

    // Get specific teacher's attendance history (with date range)
    async getTeacherAttendance(teacherId, startDate, endDate) {
        const sql = `
            SELECT 
                a.id, a.date, t.day, p.period_number AS period, p.start_time, p.end_time,
                d.dept_name AS dept, t.semester AS sem, 
                u.name AS teacher, t.subject_code AS code, r.room_no AS room, a.status, 
                a.substitute_teacher_name AS substitute, mo.name AS markedBy
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            JOIN users mo ON a.marked_by = mo.id
            JOIN departments d ON t.department_id = d.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            WHERE t.teacher_id = ? 
              AND a.date >= ? AND a.date <= ?
            ORDER BY a.date DESC, p.period_number ASC
        `;
        const [rows] = await db.promise().query(sql, [teacherId, startDate, endDate]);
        return rows;
    }

    // Get MO's marked history (MO can only see what they marked on a specific date & dept)
    async getMOHistory(moId, date, departmentId) {
        let sql = `
            SELECT 
                a.id, a.date, d.dept_name AS dept, t.semester AS sem, t.day, p.period_number AS period, 
                u.name AS teacher, t.subject_code AS code, r.room_no AS room, a.status, 
                a.substitute_teacher_name AS substitute, mo.name AS markedBy
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            JOIN users mo ON a.marked_by = mo.id
            JOIN departments d ON t.department_id = d.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            WHERE a.marked_by = ? AND a.date = ?
        `;
        let params = [moId, date];

        // Agar frontend department_id bhej raha hai, toh us se bhi filter karein
        if (departmentId) {
            sql += ` AND t.department_id = ?`;
            params.push(departmentId);
        }

        sql += ` ORDER BY p.period_number ASC`;

        const [rows] = await db.promise().query(sql, params);
        return rows;
    }
}

module.exports = new ReportModel();