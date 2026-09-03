const db = require("../../Database");

class AttendanceModel {

    async markAttendance(data) {
        // ✅ CHANGE: substitute_teacher_id ki jagah substitute_teacher_name
        const sql = `
            INSERT INTO attendance
            (timetable_id, date, status, substitute_teacher_name, marked_by,
             teacher_lat, teacher_lng, mo_lat, mo_lng,
             location_verified, time_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(sql, [
            data.timetable_id,
            data.date,
            data.status,
            data.substitute_teacher_name || null, // ✅ String value accept karega
            data.marked_by,
            data.teacher_lat || null,
            data.teacher_lng || null,
            data.mo_lat || null,
            data.mo_lng || null,
            data.location_verified,
            data.time_verified
        ]);
        return result.insertId;
    }

    async getByDate(date) {
        const sql = `
            SELECT a.*, 
                   u.name AS teacher_name,
                   r.room_no,
                   p.period_number
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN users u ON t.teacher_id = u.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            WHERE a.date = ?
            ORDER BY p.period_number
        `;
        const [rows] = await db.promise().query(sql, [date]);
        return rows;
    }

        // Teacher ki apni attendance history (Frontend ke exact fields ke sath)
    async getByTeacher(teacherId, startDate, endDate, shift) {
        let sql = `
            SELECT 
                a.date, 
                t.day, 
                p.period_number AS period, 
                p.start_time, 
                p.end_time, 
                r.room_no AS room, 
                t.subject_code AS code, 
                d.dept_name AS dept, 
                t.semester AS sem, 
                a.status, 
                a.substitute_teacher_name AS substitute
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            JOIN departments d ON t.department_id = d.id
            WHERE t.teacher_id = ?
        `;
        const params = [teacherId];

        // ✅ Frontend se aane wale filters apply karein
        if (shift) {
            sql += ` AND p.shift = ?`;
            params.push(shift);
        }
        if (startDate) {
            sql += ` AND a.date >= ?`;
            params.push(startDate);
        }
        if (endDate) {
            sql += ` AND a.date <= ?`;
            params.push(endDate);
        }

        // Date ke hisab se descending, aur period ke hisab se ascending order
        sql += ` ORDER BY a.date DESC, p.period_number ASC`;

        const [rows] = await db.promise().query(sql, params);
        return rows;
    }
}

module.exports = new AttendanceModel();