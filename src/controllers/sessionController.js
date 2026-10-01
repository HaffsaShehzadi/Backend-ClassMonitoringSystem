const sessionModel = require("../models/sessionModel");

class SessionController {
    async getAll(req, res) {
        try {
            const rows = await sessionModel.getAll();
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async getActive(req, res) {
        try {
            const session = await sessionModel.getActive();
            if (!session) return res.status(404).json({ message: "No active session found" });
            res.json(session);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { session_name, make_active } = req.body;
            if (!session_name || !session_name.trim()) {
                return res.status(400).json({ message: "Session name is required" });
            }

            const existing = await sessionModel.getByName(session_name.trim());
            if (existing) {
                return res.status(400).json({ message: `Session "${session_name.trim()}" already exists!` });
            }

            const id = await sessionModel.create(session_name.trim(), !!make_active);
            res.status(201).json({ message: "Session created successfully", id });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async setActive(req, res) {
        try {
            const { id } = req.params;
            const session = await sessionModel.getById(id);
            if (!session) return res.status(404).json({ message: "Session not found" });

            await sessionModel.setActive(id);
            res.json({ message: `"${session.session_name}" is now the active session.` });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await sessionModel.remove(id);
            res.json({ message: "Session deleted successfully" });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new SessionController();
