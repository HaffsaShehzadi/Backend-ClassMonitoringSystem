const db = require("../../Database");

class AttendanceModel {
    // 1. Mark Attendance (Live / Online)
    async markAttendance(data) {
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
            data.substitute_teacher_name || null,
            data.marked_by,
            data.teacher_lat || null,
            data.teacher_lng || null,
            data.mo_lat || null,
            data.mo_lng || null,
            data.location_verified !== undefined ? data.location_verified : 1,
            data.time_verified !== undefined ? data.time_verified : 1
        ]);
        return result.insertId;
    }

    // 2. Check if attendance already marked for this class on a specific date (Prevent duplicates)
    async findByTimetableAndDate(timetableId, date) {
        const sql = `SELECT id FROM attendance WHERE timetable_id = ? AND date = ?`;
        const [rows] = await db.promise().query(sql, [timetableId, date]);
        return rows[0] || null;
    }

    // 3. Get Attendance by ID
    async getById(id) {
        const sql = `SELECT * FROM attendance WHERE id = ?`;
        const [rows] = await db.promise().query(sql, [id]);
        return rows[0] || null;
    }

    // 4. Get Today's Attendance (All classes marked today)
    async getByDate(date) {
        const sql = `
            SELECT a.*, 
                   DATE_FORMAT(a.date, '%Y-%m-%d') as date,
                   u.name AS teacher_name,
                   r.room_no,
                   p.period_number
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            LEFT JOIN users u ON t.teacher_id = u.id
            LEFT JOIN rooms r ON t.room_id = r.id
            LEFT JOIN periods p ON t.period_id = p.id
            WHERE a.date = ?
            ORDER BY p.period_number
        `;
        const [rows] = await db.promise().query(sql, [date]);
        return rows;
    }

    // 5. Teacher ki apni attendance history (Comprehensive JOINs with all aliases)
    async getByTeacher(teacherId, filters = {}) {
        let sql = `
            SELECT a.*, 
                   DATE_FORMAT(a.date, '%Y-%m-%d') as date,
                   t.day,
                   p.period_number,
                   p.period_number AS period,
                   p.start_time,
                   p.end_time,
                   p.shift,
                   r.room_no,
                   r.room_no AS room,
                   t.subject_code,
                   t.subject_code AS code,
                   d.dept_name,
                   d.dept_name AS dept,
                   t.semester,
                   t.semester AS sem,
                   u.name AS teacher_name,
                   a.substitute_teacher_name,
                   a.substitute_teacher_name AS substitute
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            LEFT JOIN rooms r ON t.room_id = r.id
            LEFT JOIN periods p ON t.period_id = p.id
            LEFT JOIN departments d ON t.department_id = d.id
            LEFT JOIN users u ON t.teacher_id = u.id
            WHERE t.teacher_id = ?
        `;
        const params = [teacherId];

        const { startDate, endDate, shift } = filters;

        if (startDate && endDate) {
            sql += ` AND a.date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        } else if (startDate) {
            sql += ` AND a.date >= ?`;
            params.push(startDate);
        } else if (endDate) {
            sql += ` AND a.date <= ?`;
            params.push(endDate);
        }

        if (shift) {
            sql += ` AND p.shift = ?`;
            params.push(shift);
        }

        sql += ` ORDER BY a.date DESC, p.period_number ASC`;
        const [rows] = await db.promise().query(sql, params);
        return rows;
    }

    // 6. MO ki attendance history (Date aur Department ke hisaab se)
    async getMOHistory(moId, date, departmentId = null) {
        let sql = `
            SELECT a.*,
                   DATE_FORMAT(a.date, '%Y-%m-%d') as date,
                   t.day,
                   p.period_number,
                   p.period_number AS period,
                   p.start_time,
                   p.end_time,
                   p.shift,
                   r.room_no,
                   r.room_no AS room,
                   t.subject_code,
                   t.subject_code AS code,
                   d.dept_name,
                   d.dept_name AS dept,
                   t.semester,
                   t.semester AS sem,
                   u.name AS teacher_name,
                   a.substitute_teacher_name,
                   a.substitute_teacher_name AS substitute
            FROM attendance a
            JOIN timetable t ON a.timetable_id = t.id
            LEFT JOIN rooms r ON t.room_id = r.id
            LEFT JOIN periods p ON t.period_id = p.id
            LEFT JOIN departments d ON t.department_id = d.id
            LEFT JOIN users u ON t.teacher_id = u.id
            WHERE a.marked_by = ? AND a.date = ?
        `;
        const params = [moId, date];

        if (departmentId) {
            sql += ` AND t.department_id = ?`;
            params.push(departmentId);
        }

        sql += ` ORDER BY p.period_number ASC`;
        const [rows] = await db.promise().query(sql, params);
        return rows;
    }

    // 7. Upsert Offline Attendance (Sync process)
    async upsertOfflineAttendance(record, moId) {
        const existing = await this.findByTimetableAndDate(record.timetable_id, record.date);
        let attendanceId;

        if (existing) {
            const updateSql = `
                UPDATE attendance
                SET status = ?,
                    substitute_teacher_name = ?,
                    mo_lat = ?,
                    mo_lng = ?,
                    location_verified = ?,
                    marked_by = ?
                WHERE id = ?
            `;
            await db.promise().query(updateSql, [
                record.status.toLowerCase(),
                record.substitute_teacher_name || null,
                record.mo_lat || null,
                record.mo_lng || null,
                record.location_verified !== undefined ? record.location_verified : 1,
                moId,
                existing.id
            ]);
            attendanceId = existing.id;
        } else {
            const insertSql = `
                INSERT INTO attendance
                (timetable_id, date, status, substitute_teacher_name, marked_by,
                 mo_lat, mo_lng, location_verified, time_verified)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            `;
            const [result] = await db.promise().query(insertSql, [
                record.timetable_id,
                record.date,
                record.status.toLowerCase(),
                record.substitute_teacher_name || null,
                moId,
                record.mo_lat || null,
                record.mo_lng || null,
                record.location_verified !== undefined ? record.location_verified : 1
            ]);
            attendanceId = result.insertId;
        }

        return {
            success: true,
            local_id: record.local_id,
            server_id: attendanceId
        };
    }

    // 8. Update Attendance status & substitute
    async update(id, data) {
        const sql = `
            UPDATE attendance 
            SET status = ?, 
                substitute_teacher_name = ? 
            WHERE id = ?
        `;
        const [result] = await db.promise().query(sql, [
            data.status.toLowerCase(),
            data.substitute_teacher_name || null,
            id
        ]);
        return result.affectedRows > 0;
    }
}

module.exports = new AttendanceModel();