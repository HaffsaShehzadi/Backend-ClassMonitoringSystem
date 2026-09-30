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
}
module.exports = new DashboardController();