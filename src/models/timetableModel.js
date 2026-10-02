const db = require("../../Database");

// ============================================
// Timetable Model - timetable & config table database queries
// ============================================
class TimetableModel {

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

    async getByDayAndShift(day, shift, sessionId = null) {
        let sql = `
            SELECT t.*, 
                   d.dept_name,
                   r.room_no,
                   p.period_number, p.start_time, p.end_time,
                   u.name AS teacher_name,
                   s.session_name
            FROM timetable t
            JOIN departments d ON t.department_id = d.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            JOIN users u ON t.teacher_id = u.id
            LEFT JOIN sessions s ON t.session_id = s.id
            WHERE t.day = ? AND p.shift = ?
        `;
        const params = [day, shift];
        if (sessionId) {
            sql += ` AND t.session_id = ?`;
            params.push(sessionId);
        } else {
            sql += ` AND t.session_id = (SELECT id FROM sessions WHERE is_active = 1 LIMIT 1)`;
        }
        sql += ` ORDER BY p.period_number`;
        const [rows] = await db.promise().query(sql, params);
        return rows;
    }

    async getAll(sessionId = null) {
        let sql = `
            SELECT t.*,
                   d.dept_name, r.room_no,
                   p.period_number, p.start_time, p.end_time, p.shift, 
                   u.name AS teacher_name,
                   s.session_name
            FROM timetable t
            JOIN departments d ON t.department_id = d.id
            JOIN rooms r ON t.room_id = r.id
            JOIN periods p ON t.period_id = p.id
            JOIN users u ON t.teacher_id = u.id
            LEFT JOIN sessions s ON t.session_id = s.id
        `;
        const params = [];
        if (sessionId) {
            sql += ` WHERE t.session_id = ?`;
            params.push(sessionId);
        } else {
            sql += ` WHERE t.session_id = (SELECT id FROM sessions WHERE is_active = 1 LIMIT 1)`;
        }
        sql += ` ORDER BY t.day, p.period_number`;
        const [rows] = await db.promise().query(sql, params);
        return rows;
    }

    async getActiveSessionId() {
        const [rows] = await db.promise().query("SELECT id FROM sessions WHERE is_active = 1 LIMIT 1");
        return rows.length > 0 ? rows[0].id : 1;
    }

    async getSessionIdForTimetable(timetableId) {
        const [rows] = await db.promise().query("SELECT session_id FROM timetable WHERE id = ?", [timetableId]);
        return rows.length > 0 ? rows[0].session_id : 1;
    }

    async findTeacherByName(name) {
        const [rows] = await db.promise().query("SELECT id FROM users WHERE name = ? AND role = 'teacher'", [name]);
        return rows[0] || null;
    }

    async findRoomByNo(roomNo) {
        const cleanRoomNo = String(roomNo).trim();
        const [rows] = await db.promise().query("SELECT id, room_no FROM rooms WHERE room_no = ?", [cleanRoomNo]);
        return rows[0] || null;
    }

    async findDepartmentByName(deptName) {
        const [rows] = await db.promise().query("SELECT id, dept_name FROM departments WHERE dept_name = ?", [deptName]);
        return rows[0] || null;
    }

    async findPeriod(periodNumber, shift, day) {
        const periodDay = day === 'Friday' ? 'Friday' : 'Regular';
        const [rows] = await db.promise().query(
            "SELECT id FROM periods WHERE period_number = ? AND shift = ? AND day = ?",
            [periodNumber, shift, periodDay]
        );
        return rows[0] || null;
    }

    async checkTeacherConflict(teacherId, day, periodId, sessionId) {
        const [rows] = await db.promise().query(
            `SELECT t.id, u.name AS teacher_name, t.semester, d.dept_name 
             FROM timetable t
             JOIN users u ON t.teacher_id = u.id
             JOIN departments d ON t.department_id = d.id
             WHERE t.teacher_id = ? AND t.day = ? AND t.period_id = ? AND t.session_id = ?`,
            [teacherId, day, periodId, sessionId]
        );
        return rows[0] || null;
    }

    async checkRoomConflict(roomId, day, periodId, sessionId) {
        const [rows] = await db.promise().query(
            `SELECT t.id, r.room_no 
             FROM timetable t
             JOIN rooms r ON t.room_id = r.id
             WHERE t.room_id = ? AND t.day = ? AND t.period_id = ? AND t.session_id = ?`,
            [roomId, day, periodId, sessionId]
        );
        return rows[0] || null;
    }

    async checkTeacherUpdateConflict(teacherId, day, periodId, semester, timetableId, sessionId) {
        const [rows] = await db.promise().query(
            `SELECT t.id, u.name AS teacher_name, p.start_time, p.end_time FROM timetable t
             JOIN users u ON t.teacher_id = u.id JOIN periods p ON t.period_id = p.id
             WHERE t.teacher_id = ? AND t.day = ? AND t.period_id = ? AND t.semester = ? AND t.id != ? AND t.session_id = ?`,
            [teacherId, day, periodId, semester, timetableId, sessionId]
        );
        return rows[0] || null;
    }

    async checkRoomUpdateConflict(roomId, day, periodId, semester, timetableId, sessionId) {
        const [rows] = await db.promise().query(
            `SELECT t.id, r.room_no, p.start_time, p.end_time FROM timetable t
             JOIN rooms r ON t.room_id = r.id JOIN periods p ON t.period_id = p.id
             WHERE t.room_id = ? AND t.day = ? AND t.period_id = ? AND t.semester = ? AND t.id != ? AND t.session_id = ?`,
            [roomId, day, periodId, semester, timetableId, sessionId]
        );
        return rows[0] || null;
    }

    async create(data) {
        let sessionId = data.session_id;
        if (!sessionId) {
            sessionId = await this.getActiveSessionId();
        }

        const sql = `
            INSERT INTO timetable
            (session_id, department_id, semester, day, period_id, teacher_id, subject_code, room_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(sql, [
            sessionId,
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

    async remove(id) {
        const sql = `DELETE FROM timetable WHERE id = ?`;
        await db.promise().query(sql, [id]);
    }

    // ============================================
    // Config Methods (Departments, Semesters, Periods)
    // ============================================

    async getAllDepartments() {
        const [rows] = await db.promise().query("SELECT DISTINCT dept_name as name FROM departments ORDER BY dept_name");
        return rows.map(d => d.name);
    }

    async getConfigSemesters() {
        const [rows] = await db.promise().query("SELECT name FROM timetable_config WHERE config_type = 'semester'");
        let allSems = rows.map(c => c.name).filter(Boolean);
        if (allSems.length === 0) {
            allSems = ['2nd', '4th', '6th', '8th'];
            for (const sem of allSems) {
                await db.promise().query("INSERT IGNORE INTO timetable_config (config_type, name) VALUES ('semester', ?)", [sem]);
            }
        } else {
            allSems = allSems.sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
        }
        return allSems;
    }

    async getAllPeriods() {
        const [rows] = await db.promise().query("SELECT id, period_number, start_time, end_time, shift, day FROM periods ORDER BY period_number");
        return rows;
    }

    async findSemesterByName(name) {
        const [rows] = await db.promise().query("SELECT id FROM timetable_config WHERE config_type = 'semester' AND name = ?", [name]);
        return rows[0] || null;
    }

    async addSemester(name) {
        await db.promise().query("INSERT INTO timetable_config (config_type, name) VALUES ('semester', ?)", [name]);
    }

    async removeSemester(name) {
        await db.promise().query("DELETE FROM timetable_config WHERE config_type = 'semester' AND name = ?", [name]);
    }

    async renameSemester(oldName, newName) {
        await db.promise().query("UPDATE timetable_config SET name = ? WHERE config_type = 'semester' AND name = ?", [newName, oldName]);
    }

    async addPeriod({ period_number, start_time, end_time, shift, day }) {
        await db.promise().query(
            "INSERT INTO periods (period_number, start_time, end_time, shift, day) VALUES (?, ?, ?, ?, ?)",
            [period_number, start_time, end_time, shift, day]
        );
    }

    async updatePeriod(id, { start_time, end_time, shift, day }) {
        await db.promise().query(
            "UPDATE periods SET start_time = ?, end_time = ?, shift = ?, day = ? WHERE id = ?",
            [start_time, end_time, shift, day, id]
        );
    }

    async deletePeriod(id) {
        await db.promise().query("DELETE FROM periods WHERE id = ?", [id]);
    }
}

module.exports = new TimetableModel();