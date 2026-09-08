const db = require("../../Database");

class DepartmentModel {
    // Get all departments
    async getAll() {
        const [rows] = await db.promise().query(
            "SELECT id, dept_name FROM departments ORDER BY dept_name ASC"
        );
        return rows;
    }
}

module.exports = new DepartmentModel();