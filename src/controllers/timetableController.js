const timetableModel = require("../models/timetableModel");
const db = require("../../Database");

// Timetable Controller - admin CRUD operations
// CRUD = Create, Read, Update, Delete
class TimetableController {

    // GET /api/timetable/all
    // Poori timetable list (admin dashboard ke liye)
    async getAll(req, res) {
        try {
            const rows = await timetableModel.getAll();
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/timetable/by-day?day=Monday&shift=1st Shift
    // MO ki marking screen ke liye - "aaj ki classes"
    async getByDayAndShift(req, res) {
        try {
            // Query params URL se aate hain (?day=...&shift=...)
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
    // Nayi class add karna (sirf admin)
    async create(req, res) {
        try {
            const { department_id, semester, day, period_id, teacher_id, subject_code, room_id } = req.body;

            // Sab fields zaroori hain - warna error
            if (!department_id || !semester || !day || !period_id || !teacher_id || !subject_code || !room_id) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // Teacher conflict check
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

            // Room conflict check
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

            const id = await timetableModel.create(req.body);
            res.status(201).json({ message: "Class added to timetable", id });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // PUT /api/timetable/update/:id
    // Class ki maloomat badalna (sirf admin)
    async update(req, res) {
        try {
            const { day, period_id, teacher_id, room_id } = req.body;
            const timetableId = req.params.id;

            // Agar teacher/day/period change ho raha hai to conflict check karo
            if (teacher_id && day && period_id) {
                // Teacher conflict check (exclude current record)
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

            // Room conflict check (exclude current record)
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

            await timetableModel.update(req.params.id, req.body);
            res.json({ message: "Timetable updated" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // DELETE /api/timetable/delete/:id
    // Class hatana (sirf admin)
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