const db = require("../../Database");

class MonitoringDutyModel {

    async assign(data) {
        console.log("🔍 RAW DATA RECEIVED IN MODEL:", data);
        
        const { official_id, department_id, department_ids, shift, duty_date, assigned_by } = data;
        
        // Frontend se aane wali value ko hamesha Array of Numbers mein convert karein
        const rawDepts = department_ids || department_id;
        let deptIds = [];
        
        if (Array.isArray(rawDepts)) {
            deptIds = rawDepts.map(id => Number(id));
        } else if (typeof rawDepts === 'string' && rawDepts.includes(',')) {
            deptIds = rawDepts.split(',').map(id => Number(id.trim()));
        } else {
            deptIds = [Number(rawDepts)];
        }

        console.log("✅ PARSED DEPARTMENT IDS:", deptIds);

        // ✅ SAFETY CHECK: Pehle verify karein ke yeh departments database mein exist karte hain
        const placeholders = deptIds.map(() => '?').join(',');
        const [existingDepts] = await db.promise().query(
            `SELECT id FROM departments WHERE id IN (${placeholders})`, 
            deptIds
        );
        
        const existingDeptIds = existingDepts.map(d => d.id);
        const missingDepts = deptIds.filter(id => !existingDeptIds.includes(id));

        // Agar koi department missing hai, toh clear error throw karein
        if (missingDepts.length > 0) {
            throw new Error(`Departments with IDs [${missingDepts.join(', ')}] do not exist in the database! Please check your departments table.`);
        }

        // ✅ Agar sab theek hain, toh Bulk Insert karein
        const insertPlaceholders = deptIds.map(() => '(?, ?, ?, ?, ?)').join(', ');
        const sql = `
            INSERT INTO duty_assignments 
            (official_id, department_id, shift, duty_date, assigned_by)
            VALUES ${insertPlaceholders}
        `;

        const values = deptIds.flatMap(deptId => [
            Number(official_id),
            Number(deptId),
            shift,
            duty_date,
            Number(assigned_by)
        ]);

        console.log("🚀 EXECUTING SQL WITH VALUES:", values);

        const [result] = await db.promise().query(sql, values);
        
        const startId = result.insertId;
        const insertedIds = [];
        for (let i = 0; i < deptIds.length; i++) {
            insertedIds.push(startId + i);
        }
        
        return insertedIds;
    }

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

    async remove(id) {
        const sql = `DELETE FROM duty_assignments WHERE id = ?`;
        await db.promise().query(sql, [id]);
    }

    async deleteByOfficialAndDateAndShift(official_id, duty_date, shift) {
        const sql = `DELETE FROM duty_assignments WHERE official_id = ? AND duty_date = ? AND shift = ?`;
        await db.promise().query(sql, [official_id, duty_date, shift]);
    }
}

module.exports = new MonitoringDutyModel();