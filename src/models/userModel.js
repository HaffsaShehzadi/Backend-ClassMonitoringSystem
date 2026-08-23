const db = require("../../Database");

// User Model - users table ka data handle karta hai
class UserModel {

    // Naya user register karna
    // status 'pending' rakha taa ke admin approve kare
    async createUser(userData) {
        const sql = `
            INSERT INTO users
            (name, email, password, role, department_id, status, join_date)
            VALUES (?, ?, ?, ?, ?, 'pending', CURDATE())
        `;
        const [result] = await db.promise().query(sql, [
            userData.name,
            userData.email,
            userData.password,
            userData.role,
            userData.departmentId
        ]);
        return result.insertId;   // naye user ki id wapas dena
    }

    // Email se user dhundo (department name ke saath)
    // LEFT JOIN: taa ke department ka naam bhi result mein aaye
    async findUserByEmail(email) {
        const sql = `
            SELECT u.*, d.dept_name AS department
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            WHERE u.email = ?
        `;
        const [rows] = await db.promise().query(sql, [email]);
        return rows[0];   // pehla user return karo
    }

    // Department name se id lana
    // Agar department naya hai to pehle bana dena
    async getOrCreateDepartment(deptName) {
        // Pehle check karo pehle se hai ya nahi
        const [rows] = await db.promise().query(
            "SELECT id FROM departments WHERE dept_name = ?",
            [deptName]
        );
        if (rows.length > 0) return rows[0].id;

        // Nahi hai to naya bana do
        const [result] = await db.promise().query(
            "INSERT INTO departments (dept_name) VALUES (?)",
            [deptName]
        );
        return result.insertId;
    }
}

module.exports = new UserModel();