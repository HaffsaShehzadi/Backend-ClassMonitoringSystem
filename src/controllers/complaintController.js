const complaintModel = require("../models/complaintModel");

class ComplaintController {
    async create(req, res) {
        try {
            const { text } = req.body;
            const teacherId = req.user.user_id;
            if (!text) {
                return res.status(400).json({ message: "Complaint text required" });
            }
            const id = await complaintModel.create(teacherId, text);
            res.status(201).json({ message: "Complaint submitted successfully", id });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async getMine(req, res) {
        try {
            const rows = await complaintModel.getByTeacher(req.user.user_id);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async getAll(req, res) {
        try {
            const rows = await complaintModel.getAll();
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
    async updateStatus(req, res) {
        try {
            const { status } = req.body;

            // Sirf resolved ya rejected allowed hai
            if (!["resolved", "rejected"].includes(status)) {
                return res.status(400).json({ message: "Status must be 'resolved' or 'rejected'" });
            }

            await complaintModel.updateStatus(req.params.id, status);
            res.json({ message: `Complaint ${status} successfully` });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new ComplaintController();