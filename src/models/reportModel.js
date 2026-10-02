class ReportModel {

    // 1. Get attendance by department (with date range)
    async getDepartmentAttendance(departmentId, startDate, endDate) {
        const sql = `
            SELECT 
                a.id, DATE_FORMAT(a.date, '%Y-%m-%d') AS date, d.dept_name AS dept, t.semester AS sem, t.day, p.period_number AS period, 
                p.shift, u.name AS teacher, t.subject_code AS code, r.room_no AS room, a.status, 
                a.substitute_teacher_name AS substitute, mo.name AS markedBy
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            LEFT JOIN users mo ON a.marked_by = mo.id       /* ✅ FIX: LEFT JOIN */
            JOIN departments d ON t.department_id = d.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            WHERE t.department_id = ? 
              AND DATE(a.date) >= ? AND DATE(a.date) <= ?   /* ✅ FIX: DATE() function */
            ORDER BY a.date DESC, p.period_number ASC
        `;
        const [rows] = await db.promise().query(sql, [departmentId, startDate, endDate]);
        return rows;
    }

    // 2. Get specific teacher's attendance history (with date range)
    async getTeacherAttendance(teacherId, startDate, endDate) {
        const sql = `
            SELECT 
                a.id, DATE_FORMAT(a.date, '%Y-%m-%d') AS date, t.day, p.period_number AS period, p.start_time, p.end_time,
                p.shift, d.dept_name AS dept, t.semester AS sem, 
                u.name AS teacher, t.subject_code AS code, r.room_no AS room, a.status, 
                a.substitute_teacher_name AS substitute, mo.name AS markedBy
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            LEFT JOIN users mo ON a.marked_by = mo.id       /* ✅ FIX: LEFT JOIN */
            JOIN departments d ON t.department_id = d.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            WHERE t.teacher_id = ? 
              AND DATE(a.date) >= ? AND DATE(a.date) <= ?   /* ✅ FIX: DATE() function */
            ORDER BY a.date DESC, p.period_number ASC
        `;
        const [rows] = await db.promise().query(sql, [teacherId, startDate, endDate]);
        return rows;
    }

    // 3. Get MO's marked history
    async getMOHistory(moId, date, departmentId) {
        let sql = `
            SELECT 
                a.id, DATE_FORMAT(a.date, '%Y-%m-%d') AS date, d.dept_name AS dept, t.semester AS sem, t.day, p.period_number AS period, 
                p.shift, u.name AS teacher, t.subject_code AS code, r.room_no AS room, a.status, 
                a.substitute_teacher_name AS substitute, mo.name AS markedBy
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            LEFT JOIN users mo ON a.marked_by = mo.id       /* ✅ FIX: LEFT JOIN */
            JOIN departments d ON t.department_id = d.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            WHERE a.marked_by = ? AND DATE(a.date) = ?      /* ✅ FIX: DATE() function */
        `;
        let params = [moId, date];

        if (departmentId) {
            sql += ` AND t.department_id = ?`;
            params.push(departmentId);
        }

        sql += ` ORDER BY p.period_number ASC`;

        const [rows] = await db.promise().query(sql, params);
        return rows;
    }
}