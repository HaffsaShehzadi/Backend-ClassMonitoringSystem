const db = require("../../Database");

// ============================================
// Monitoring Duty Model - duty_assignments table
// Admin MO ko duty assign karta hai
// ============================================
class MonitoringDutyModel {

    // Admin nayi duty assign karta hai
    // ✅ UPDATED: Ab multiple departments ek sath insert kar sakta hai (Bulk Insert)
    async assign(data) {
        const { official_id, department_ids, shift, duty_date, assigned_by } = data;
        
        // Agar array nahi hai to single value ko array bana do
        const deptIds = Array.isArray(department_ids) ? department_ids : [department_ids];

        // ✅ BULK INSERT: Ek query mein multiple rows insert karna
        // Yeh fast aur efficient hai
        const placeholders = deptIds.map(() => '(?, ?, ?, ?, ?)').join(', ');
        
        const sql = `
            INSERT INTO duty_assignments 
            (official_id, department_id, shift, duty_date, assigned_by)
            VALUES ${placeholders}
        `;

        // Values ko flatten karna taake SQL query mein pass kar sakein
        const values = deptIds.flatMap(deptId => [
            official_id,
            deptId,
            shift,
            duty_date,
            assigned_by
        ]);

        const [result] = await db.promise().query(sql, values);
        
        // Saare inserted IDs return karein
        const startId = result.insertId;
        const insertedIds = [];
        for (let i = 0; i < deptIds.length; i++) {
            insertedIds.push(startId + i);
        }
        
        return insertedIds;
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
    // Admin kisi specific MO ki us din ki purani duties delete karta hai (Edit se pehle)
    async deleteByOfficialAndDate(official_id, duty_date) {
        const sql = `DELETE FROM duty_assignments WHERE official_id = ? AND duty_date = ?`;
        await db.promise().query(sql, [official_id, duty_date]);
    }
        // Admin kisi specific MO ki us din ki purani duties delete karta hai
    async deleteByOfficialAndDate(official_id, duty_date) {
        const sql = `DELETE FROM duty_assignments WHERE official_id = ? AND duty_date = ?`;
        await db.promise().query(sql, [official_id, duty_date]);
    }
        // Admin kisi specific MO ki us din ki aur us shift ki purani duties delete karta hai
    async deleteByOfficialAndDateAndShift(official_id, duty_date, shift) {
        const sql = `DELETE FROM duty_assignments WHERE official_id = ? AND duty_date = ? AND shift = ?`;
        await db.promise().query(sql, [official_id, duty_date, shift]);
    }
}

module.exports = new MonitoringDutyModel();