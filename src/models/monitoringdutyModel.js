const db = require("../../Database");

// ============================================
// Monitoring Duty Model - duty_assignments table
// Admin MO ko duty assign karta hai
// ============================================
class MonitoringDutyModel {

    // Admin nayi duty assign karta hai
    async assign(data) {
        const sql = `
            INSERT INTO duty_assignments 
            (official_id, department_id, shift, duty_date, assigned_by)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await db.promise().query(sql, [
            data.official_id,      // MO ki id
            data.department_id,    // kis department ki duty
            data.shift,            // 1st Shift / 2nd Shift
            data.duty_date,        // kis din ki duty (YYYY-MM-DD)
            data.assigned_by       // admin ki id (token se)
        ]);
        return result.insertId;
    }

    // MO apni KHUD ki duties dekhta hai
    async getByOfficial(officialId) {
        const sql = `
            SELECT da.*, d.dept_name
            FROM duty_assignments da
            JOIN departments d ON da.department_id = d.id
            WHERE da.official_id = ?
            ORDER BY da.duty_date DESC
        `;
        const [rows] = await db.promise().query(sql, [officialId]);
        return rows;
    }

    // Admin SARI assignments dekhta hai (names ke saath)
    async getAll() {
        const sql = `
            SELECT da.*,
                   d.dept_name,
                   u.name AS official_name,
                   a.name AS assigned_by_name
            FROM duty_assignments da
            JOIN departments d ON da.department_id = d.id
            JOIN users u ON da.official_id = u.id
            JOIN users a ON da.assigned_by = a.id
            ORDER BY da.duty_date DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }

    // Admin duty wapas leta hai (delete)
    async remove(id) {
        const sql = `DELETE FROM duty_assignments WHERE id = ?`;
        await db.promise().query(sql, [id]);
    }
}

module.exports = new MonitoringDutyModel();