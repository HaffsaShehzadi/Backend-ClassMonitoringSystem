const dashboardModel = require("../models/dashboardModel");

class DashboardController {
    async getAdminDashboard(req, res) {
        try {
            const stats = await dashboardModel.getAdminDashboard();
            res.status(200).json(stats); 
        } catch (error) {
            console.error("Get Admin Dashboard Error:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/dashboard/pending-users
    async getPendingUsers(req, res) {
        try {
            const rows = await dashboardModel.getPendingUsers();
            res.json(rows);
        } catch (error) {
            console.error("Get Pending Users Error:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // PUT /api/dashboard/approve/:id
    async approveUser(req, res) {
        try {
            await dashboardModel.approveUser(req.params.id);
            res.json({ message: "User approved successfully. They can now login." });
        } catch (error) {
            console.error("Approve User Error:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // PUT /api/dashboard/reject/:id
    async rejectUser(req, res) {
        try {
            await dashboardModel.rejectUser(req.params.id);
            res.json({ message: "User rejected successfully." });
        } catch (error) {
            console.error("Reject User Error:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/dashboard/rejected-users
    async getRejectedUsers(req, res) {
        try {
            const rows = await dashboardModel.getRejectedUsers();
            res.json(rows);
        } catch (error) {
            console.error("Get Rejected Users Error:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // DELETE /api/dashboard/rejected/:id
    async deleteRejectedUser(req, res) {
        try {
            await dashboardModel.deleteRejectedUser(req.params.id);
            res.json({ message: "User deleted permanently from the system." });
        } catch (error) {
            console.error("Delete Rejected User Error:", error.message);
            if (error.message === "User not found") {
                return res.status(404).json({ message: "User not found" });
            }
            res.status(500).json({ message: "Server error while deleting user", error: error.message });
        }
    }
}
module.exports = new DashboardController();