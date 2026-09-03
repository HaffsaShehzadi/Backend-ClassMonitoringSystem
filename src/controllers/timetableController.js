const timetableModel = require("../models/timetableModel");
const db = require("../../Database");

// Timetable Controller - admin CRUD operations
// CRUD = Create, Read, Update, Delete
class TimetableController {

    // GET /api/timetable/all
    async getAll(req, res) {
        try {
            const rows = await timetableModel.getAll();
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/timetable/by-day?day=Monday&shift=1st Shift
    async getByDayAndShift(req, res) {
        try {
            const { day, shift } = req.query;
            if (!day || !shift) {
                return res.status(400).json({ message: "day and shift required" });
            }
            const rows = await timetableModel.getByDayAndShift(day, shift);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // POST /api/timetable/create
    async create(req, res) {
        try {
            // ✅ Frontend se Text (Naam/Number) aa raha hai
            const { teacher_name, room_no, department_name, subject_code, semester, day, period_number } = req.body;

            // Sab fields zaroori hain - warna error
            if (!teacher_name || !room_no || !department_name || !subject_code || !semester || !day || !period_number) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // ✅ SMART MAPPING: Database se IDs dhundo (Text se ID banayenge)
            const [teacherRows] = await db.promise().query("SELECT id FROM users WHERE name = ? AND role = 'teacher'", [teacher_name]);
            if (teacherRows.length === 0) return res.status(400).json({ message: "Teacher not found in database. Please check spelling." });
            const teacher_id = teacherRows[0].id;

            const [roomRows] = await db.promise().query("SELECT id FROM rooms WHERE room_no = ?", [room_no]);
            if (roomRows.length === 0) return res.status(400).json({ message: "Room not found in database. Please check room number." });
            const room_id = roomRows[0].id;

            const [deptRows] = await db.promise().query("SELECT id FROM departments WHERE dept_name = ?", [department_name]);
            if (deptRows.length === 0) return res.status(400).json({ message: "Department not found in database." });
            const department_id = deptRows[0].id;

            const [periodRows] = await db.promise().query("SELECT id FROM periods WHERE period_number = ?", [period_number]);
            if (periodRows.length === 0) return res.status(400).json({ message: "Period not found in database." });
            const period_id = periodRows[0].id;

            // ✅ AAPKA ORIGINAL CONFLICT CHECK LOGIC (Bilkul same, koi change nahi)
            const [teacherConflict] = await db.promise().query(
                `SELECT t.id, u.name AS teacher_name, p.start_time, p.end_time
                 FROM timetable t
                 JOIN users u ON t.teacher_id = u.id
                 JOIN periods p ON t.period_id = p.id
                 WHERE t.teacher_id = ? AND t.day = ? AND t.period_id = ?`,
                [teacher_id, day, period_id]
            );

            if (teacherConflict.length > 0) {
                return res.status(400).json({
                    message: "Teacher already has a class at this time",
                    conflict: {
                        teacher_name: teacherConflict[0].teacher_name,
                        time: `${teacherConflict[0].start_time} - ${teacherConflict[0].end_time}`
                    }
                });
            }

            const [roomConflict] = await db.promise().query(
                `SELECT t.id, r.room_no, p.start_time, p.end_time
                 FROM timetable t
                 JOIN rooms r ON t.room_id = r.id
                 JOIN periods p ON t.period_id = p.id
                 WHERE t.room_id = ? AND t.day = ? AND t.period_id = ?`,
                [room_id, day, period_id]
            );

            if (roomConflict.length > 0) {
                return res.status(400).json({
                    message: "Room is already booked at this time",
                    conflict: {
                        room_no: roomConflict[0].room_no,
                        time: `${roomConflict[0].start_time} - ${roomConflict[0].end_time}`
                    }
                });
            }

            // ✅ Model ko IDs ke sath bhejo taake save ho jaye
            const id = await timetableModel.create({
                department_id,
                semester,
                day,
                period_id,
                teacher_id,
                subject_code,
                room_id
            });

            res.status(201).json({ message: "Class added to timetable", id });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // PUT /api/timetable/update/:id
    async update(req, res) {
        try {
            // ✅ Frontend se Text (Naam/Number) aa raha hai
            const { teacher_name, room_no, department_name, subject_code, semester, day, period_number } = req.body;
            const timetableId = req.params.id;

            // ✅ SMART MAPPING for Update bhi
            const [teacherRows] = await db.promise().query("SELECT id FROM users WHERE name = ? AND role = 'teacher'", [teacher_name]);
            const teacher_id = teacherRows.length > 0 ? teacherRows[0].id : null;

            const [roomRows] = await db.promise().query("SELECT id FROM rooms WHERE room_no = ?", [room_no]);
            const room_id = roomRows.length > 0 ? roomRows[0].id : null;

            const [deptRows] = await db.promise().query("SELECT id FROM departments WHERE dept_name = ?", [department_name]);
            const department_id = deptRows.length > 0 ? deptRows[0].id : null;

            const [periodRows] = await db.promise().query("SELECT id FROM periods WHERE period_number = ?", [period_number]);
            const period_id = periodRows.length > 0 ? periodRows[0].id : null;

            // ✅ AAPKA ORIGINAL CONFLICT CHECK LOGIC (Bilkul same)
            if (teacher_id && day && period_id) {
                const [teacherConflict] = await db.promise().query(
                    `SELECT t.id, u.name AS teacher_name, p.start_time, p.end_time
                     FROM timetable t
                     JOIN users u ON t.teacher_id = u.id
                     JOIN periods p ON t.period_id = p.id
                     WHERE t.teacher_id = ? AND t.day = ? AND t.period_id = ? AND t.id != ?`,
                    [teacher_id, day, period_id, timetableId]
                );

                if (teacherConflict.length > 0) {
                    return res.status(400).json({
                        message: "Teacher already has a class at this time",
                        conflict: {
                            teacher_name: teacherConflict[0].teacher_name,
                            time: `${teacherConflict[0].start_time} - ${teacherConflict[0].end_time}`
                        }
                    });
                }
            }

            if (room_id && day && period_id) {
                const [roomConflict] = await db.promise().query(
                    `SELECT t.id, r.room_no, p.start_time, p.end_time
                     FROM timetable t
                     JOIN rooms r ON t.room_id = r.id
                     JOIN periods p ON t.period_id = p.id
                     WHERE t.room_id = ? AND t.day = ? AND t.period_id = ? AND t.id != ?`,
                    [room_id, day, period_id, timetableId]
                );

                if (roomConflict.length > 0) {
                    return res.status(400).json({
                        message: "Room is already booked at this time",
                        conflict: {
                            room_no: roomConflict[0].room_no,
                            time: `${roomConflict[0].start_time} - ${roomConflict[0].end_time}`
                        }
                    });
                }
            }

            await timetableModel.update(timetableId, {
                department_id,
                semester,
                day,
                period_id,
                teacher_id,
                subject_code,
                room_id
            });
            
            res.json({ message: "Timetable updated" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // DELETE /api/timetable/delete/:id
    async remove(req, res) {
        try {
            await timetableModel.remove(req.params.id);
            res.json({ message: "Class removed from timetable" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new TimetableController();