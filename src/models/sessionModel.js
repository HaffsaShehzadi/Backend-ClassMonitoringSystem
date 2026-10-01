const db = require("../../Database");

class SessionModel {
    async getAll() {
        const sql = `
            SELECT s.*, 
                   COUNT(t.id) AS classes_count
            FROM sessions s
            LEFT JOIN timetable t ON s.id = t.session_id
            GROUP BY s.id
            ORDER BY s.is_active DESC, s.id DESC
        `;
        const [rows] = await db.promise().query(sql);
        return rows;
    }

    async getActive() {
        const sql = `SELECT * FROM sessions WHERE is_active = 1 LIMIT 1`;
        const [rows] = await db.promise().query(sql);
        return rows[0] || null;
    }

    async getById(id) {
        const sql = `SELECT * FROM sessions WHERE id = ?`;
        const [rows] = await db.promise().query(sql, [id]);
        return rows[0] || null;
    }

    async getByName(name) {
        const sql = `SELECT * FROM sessions WHERE LOWER(TRIM(session_name)) = LOWER(TRIM(?))`;
        const [rows] = await db.promise().query(sql, [name]);
        return rows[0] || null;
    }

    async create(session_name, makeActive = false) {
        // Check if any sessions exist; if 0, make it active automatically
        const [existing] = await db.promise().query(`SELECT COUNT(*) as count FROM sessions`);
        const shouldBeActive = makeActive || existing[0].count === 0;

        if (shouldBeActive) {
            await db.promise().query(`UPDATE sessions SET is_active = 0`);
        }
        const isActive = shouldBeActive ? 1 : 0;
        const sql = `INSERT INTO sessions (session_name, is_active) VALUES (?, ?)`;
        const [result] = await db.promise().query(sql, [session_name.trim(), isActive]);
        return result.insertId;
    }

    async setActive(id) {
        await db.promise().query(`UPDATE sessions SET is_active = 0`);
        await db.promise().query(`UPDATE sessions SET is_active = 1 WHERE id = ?`, [id]);
        return true;
    }

    async remove(id) {
        const session = await this.getById(id);
        if (!session) throw new Error("Session not found");
        if (session.is_active) {
            throw new Error("Cannot delete the active session. Please activate another session first.");
        }

        // Check if historical attendance records exist for any classes in this session
        const [attCheck] = await db.promise().query(`
            SELECT COUNT(*) as count 
            FROM attendance a 
            JOIN timetable t ON a.timetable_id = t.id 
            WHERE t.session_id = ?
        `, [id]);

        if (attCheck[0].count > 0) {
            throw new Error(`Cannot delete this session because it has ${attCheck[0].count} historical attendance records linked to it.`);
        }

        // Delete timetable classes belonging to this session
        await db.promise().query(`DELETE FROM timetable WHERE session_id = ?`, [id]);

        // Delete the session itself
        await db.promise().query(`DELETE FROM sessions WHERE id = ?`, [id]);
        return true;
    }
}

// Auto-initialize sessions table, default session, and timetable session_id
(async function initSessionsTable() {
    try {
        await db.promise().query(`
            CREATE TABLE IF NOT EXISTS \`sessions\` (
              \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
              \`session_name\` VARCHAR(100) NOT NULL UNIQUE,
              \`is_active\` TINYINT(1) DEFAULT 0,
              \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        const [existing] = await db.promise().query(`SELECT COUNT(*) as count FROM \`sessions\``);
        if (existing[0].count === 0) {
            await db.promise().query(`
                INSERT INTO \`sessions\` (\`id\`, \`session_name\`, \`is_active\`) 
                VALUES (1, 'Session 2026 Winter', 1)
                ON DUPLICATE KEY UPDATE \`session_name\` = 'Session 2026 Winter', \`is_active\` = 1;
            `);
        } else {
            const [active] = await db.promise().query(`SELECT id FROM \`sessions\` WHERE is_active = 1 LIMIT 1`);
            if (active.length === 0) {
                await db.promise().query(`UPDATE \`sessions\` SET is_active = 1 ORDER BY id ASC LIMIT 1`);
            }
        }

        try {
            await db.promise().query(`
                ALTER TABLE \`timetable\` 
                ADD COLUMN \`session_id\` INT NOT NULL DEFAULT 1 AFTER \`id\`;
            `);
        } catch (colErr) {
            // Column already exists
        }

        await db.promise().query(`
            UPDATE \`timetable\` 
            SET \`session_id\` = 1 
            WHERE \`session_id\` IS NULL OR \`session_id\` = 0;
        `);

        console.log("✅ Academic Sessions table & Session 2026 Winter verified in Database!");
    } catch (err) {
        console.error("⚠️ Sessions init notice:", err.message);
    }
})();

module.exports = new SessionModel();
