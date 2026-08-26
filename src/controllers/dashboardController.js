const dashboardModel = require("../models/dashboardModel");

// Dashboard Controller - admin counts + teacher approval system
class DashboardController {

    // GET /api/dashboard/admin
    // Admin dashboard ke counts (cards ke liye)
    async getAdminDashboard(req, res) {
        try {
            const stats = await dashboardModel.getAdminDashboard();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/dashboard/pending-users
    // Pending teachers ki list (approval screen ke liye)
    async getPendingUsers(req, res) {
        try {
            const rows = await dashboardModel.getPendingUsers();
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // PUT /api/dashboard/approve/:id
    // Admin teacher ko approve karta hai
    async approveUser(req, res) {
        try {
            await dashboardModel.approveUser(req.params.id);
            res.json({ message: "User approved successfully. They can now login." });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // PUT /api/dashboard/reject/:id
    // Admin teacher ko reject karta hai
    async rejectUser(req, res) {
        try {
            await dashboardModel.rejectUser(req.params.id);
            res.json({ message: "User rejected" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new DashboardController();