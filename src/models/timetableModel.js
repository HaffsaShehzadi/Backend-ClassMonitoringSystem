const db = require("../../Database");

// ============================================
// Timetable Model - timetable table handle karta hai
// (section column hataya gaya - zarurat nahi thi)
// ============================================
class TimetableModel {

    // Ek timetable entry ki POORI maloomat (JOIN ke saath)
    // Attendance validation ko room GPS + period time chahiye
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

    // Specific day + shift ki sari classes (MO marking screen)
    async getByDayAndShift(day, shift) {
        const sql = `
            SELECT t.*, 
                   d.dept_name,
                   r.room_no,
                   p.period_number, p.start_time, p.end_time,
                   u.name AS teacher_name
            FROM timetable t
            JOIN departments d ON t.department_id = d.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            JOIN users u ON t.teacher_id = u.id
            WHERE t.day = ? AND p.shift = ?
            ORDER BY p.period_number
        `;
        const [rows] = await db.promise().query(sql, [day, shift]);
        return rows;
    }

    // Poori timetable list (admin ke liye)
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
            (department_id, semester, day, period_id, teacher_id, subject_code, room_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(sql, [
            data.department_id,
            data.semester,
            data.day,
            data.period_id,
            data.teacher_id,
            data.subject_code,
            data.room_id
        ]);
        return result.insertId;
    }

    // Class update karna (admin)
    async update(id, data) {
        const sql = `
            UPDATE timetable
            SET department_id = ?, semester = ?, day = ?, period_id = ?,
                teacher_id = ?, subject_code = ?, room_id = ?
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
            id
        ]);
    }

    // Class delete karna (admin)
    async remove(id) {
        const sql = `DELETE FROM timetable WHERE id = ?`;
        await db.promise().query(sql, [id]);
    }
    //check if teacher has a class at the same day and period (for conflict checking)
    async checkConflict(teacherId, day, periodId, excludeId = null) {
    let sql = `
        SELECT * FROM timetable 
        WHERE teacher_id = ? AND day = ? AND period_id = ?
    `;
    const params = [teacherId, day, periodId];
    
    if (excludeId) {
        sql += ` AND id != ?`;
        params.push(excludeId);
    }
    
    const [rows] = await db.promise().query(sql, params);
    return rows.length > 0; // true = conflict hai
}
}

module.exports = new TimetableModel();