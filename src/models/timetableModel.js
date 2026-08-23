const db = require("../../Database");

// ============================================
// Timetable Model - timetable table handle karta hai
// Naya schema: department_id, semester, day, period_id,
//              teacher_id, subject_code, room_id, section
// ============================================
class TimetableModel {

    // Ek timetable entry ki POORI maloomat (JOIN ke saath)
    // Attendance validation ko ye sab chahiye:
    //   - room ka GPS + radius (location check)
    //   - period ka time (time check)
    //   - teacher_id (teacher ki location ke liye)
    async getById(id) {
        const sql = `
            SELECT t.*, 
                   r.room_no, r.latitude AS room_lat, 
                   r.longitude AS room_lng, r.radius_meters,
                   p.period_number, p.start_time, p.end_time, p.shift
            FROM timetable t
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            WHERE t.id = ?
        `;
        const [rows] = await db.promise().query(sql, [id]);
        return rows[0];
    }

    // Specific day + shift ki sari classes
    // (MO ki marking screen - "aaj ki classes")
    async getByDayAndShift(day, shift) {
        const sql = `
            SELECT t.*, 
                   r.room_no,
                   p.period_number, p.start_time, p.end_time,
                   u.name AS teacher_name
            FROM timetable t
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            JOIN users u ON t.teacher_id = u.id
            WHERE t.day = ? AND p.shift = ?
            ORDER BY p.period_number
        `;
        const [rows] = await db.promise().query(sql, [day, shift]);
        return rows;
    }

    // Poori timetable list (admin ke liye - JOIN ke saath)
    async getAll() {
        const sql = `
            SELECT t.*,
                   d.dept_name, r.room_no,
                   p.period_number, p.start_time, p.end_time,
                   u.name AS teacher_name
            FROM timetable t
            JOIN departments d ON t.department_id = d.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            JOIN users u ON t.teacher_id = u.id
            ORDER BY t.day, p.period_number
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }

    // Nayi class add karna (admin)
    async create(data) {
        const sql = `
            INSERT INTO timetable
            (department_id, semester, day, period_id, teacher_id, subject_code, room_id, section)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(sql, [
            data.department_id,
            data.semester,
            data.day,
            data.period_id,
            data.teacher_id,
            data.subject_code,
            data.room_id,
            data.section
        ]);
        return result.insertId;
    }

    // Class update karna (admin)
    async update(id, data) {
        const sql = `
            UPDATE timetable
            SET department_id = ?, semester = ?, day = ?, period_id = ?,
                teacher_id = ?, subject_code = ?, room_id = ?, section = ?
            WHERE id = ?
        `;
        await db.promise().query(sql, [
            data.department_id,
            data.semester,
            data.day,
            data.period_id,
            data.teacher_id,
            data.subject_code,
            data.room_id,
            data.section,
            id
        ]);
    }

    // Class delete karna (admin)
    async remove(id) {
        const sql = `DELETE FROM timetable WHERE id = ?`;
        await db.promise().query(sql, [id]);
    }
}

module.exports = new TimetableModel();