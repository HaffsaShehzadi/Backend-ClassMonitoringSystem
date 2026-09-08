const departmentModel = require("../models/departmentModel");

class DepartmentController {
    // GET /api/departments/all
    async getAll(req, res) {
        try {
            const rows = await departmentModel.getAll();
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new DepartmentController();