const db = require("../../Database");

class ComplaintModel {
    async create(teacherId, text) {
        const sql = `
            INSERT INTO complaints (teacher_id, complaint_text, status, created_date)
            VALUES (?, ?, 'pending', CURDATE())
        `;
        const [result] = await db.promise().query(sql, [teacherId, text]);
        return result.insertId;
    }
    async getByTeacher(teacherId) {
        const sql = `
            SELECT 
                id, 
                complaint_text AS text, 
                DATE_FORMAT(created_date, '%Y-%m-%d') AS date, 
                status, 
                DATE_FORMAT(resolved_date, '%Y-%m-%d') AS resolvedDate
            FROM complaints
            WHERE teacher_id = ?
            ORDER BY created_date DESC
        `;
        const [rows] = await db.promise().query(sql, [teacherId]);
        return rows;
    }
    async getAll() {
        const sql = `
            SELECT 
                c.id, 
                c.complaint_text AS text, 
                DATE_FORMAT(c.created_date, '%Y-%m-%d') AS date, 
                u.name AS submittedBy, 
                d.dept_name AS department, 
                c.status, 
                DATE_FORMAT(c.resolved_date, '%Y-%m-%d') AS resolvedDate
            FROM complaints c
            JOIN users u ON c.teacher_id = u.id
            LEFT JOIN departments d ON u.department_id = d.id
            ORDER BY c.created_date DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }
    async updateStatus(id, status) {
        const sql = `
            UPDATE complaints
            SET status = ?, resolved_date = CURDATE()
            WHERE id = ?
        `;
        await db.promise().query(sql, [status, id]);
    }
}

module.exports = new ComplaintModel();