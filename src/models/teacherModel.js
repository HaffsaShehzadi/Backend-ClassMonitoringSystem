const db = require("../../Database");

class TeacherModel {

    getDepartments(callback) {

        const sql = `
            SELECT
                department_id,
                department_name
            FROM departments
            ORDER BY department_name
        `;

        db.query(sql, callback);

    }

}

module.exports = new TeacherModel();