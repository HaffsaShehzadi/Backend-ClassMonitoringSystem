const complaintModel = require("../models/complaintModel");

// ============================================
// Complaint Controller - teacher + admin logic
// ============================================
class ComplaintController {

    // POST /api/complaints/create
    // Teacher nayi complaint submit karta hai
    async create(req, res) {
        try {
            const { text } = req.body;
            const teacherId = req.user.user_id;   // token se teacher ki id

            // Text khali nahi hona chahiye
            if (!text) {
                return res.status(400).json({ message: "Complaint text required" });
            }

            const id = await complaintModel.create(teacherId, text);
            res.status(201).json({ message: "Complaint submitted successfully", id });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/complaints/all
    // Admin sari complaints dekhta hai (sirf admin)
    async getAll(req, res) {
        try {
            const rows = await complaintModel.getAll();
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/complaints/mine
    // Teacher apni khud ki complaints dekhta hai
    async getMine(req, res) {
        try {
            const rows = await complaintModel.getByTeacher(req.user.user_id);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // PUT /api/complaints/status/:id
    // Admin complaint resolve ya reject karta hai (sirf admin)
    async updateStatus(req, res) {
        try {
            const { status } = req.body;

            // Sirf resolved ya rejected allowed hai
            if (!["resolved", "rejected"].includes(status)) {
                return res.status(400).json({ message: "Status must be 'resolved' or 'rejected'" });
            }

            await complaintModel.updateStatus(req.params.id, status);
            res.json({ message: "Complaint " + status + " ✅" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new ComplaintController();