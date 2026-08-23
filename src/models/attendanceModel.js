const db = require("../../Database");

// Attendance Model - attendance table handle karta hai
// Har record mein location + time proof save hota hai
class AttendanceModel {

    // Attendance mark karna (validation flags ke saath)
    // location_verified / time_verified: 1 = pass, 0 = fail
    async markAttendance(data) {
        const sql = `
            INSERT INTO attendance
            (timetable_id, date, status, substitute_teacher_id, marked_by,
             teacher_lat, teacher_lng, mo_lat, mo_lng,
             location_verified, time_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(sql, [
            data.timetable_id,
            data.date,
            data.status,
            data.substitute_teacher_id || null,   // optional hai
            data.marked_by,                        // MO ki id (token se)
            data.teacher_lat || null,              // proof ke liye save
            data.teacher_lng || null,
            data.mo_lat || null,
            data.mo_lng || null,
            data.location_verified,
            data.time_verified
        ]);
        return result.insertId;
    }

    // Kisi date ki sari attendance (MO / admin ke liye)
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

    // Teacher ki apni attendance history
    // (Teacher dashboard ke liye)
    async getByTeacher(teacherId) {
        const sql = `
            SELECT a.*, r.room_no, p.period_number, t.day
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            WHERE t.teacher_id = ?
            ORDER BY a.date DESC
        `;
        const [rows] = await db.promise().query(sql, [teacherId]);
        return rows;
    }
}

module.exports = new AttendanceModel();