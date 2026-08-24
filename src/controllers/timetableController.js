const timetableModel = require("../models/timetableModel");

// ============================================
// Timetable Controller - admin CRUD operations
// CRUD = Create, Read, Update, Delete
// ============================================
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
            // :id URL se aata hai (req.params.id)
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