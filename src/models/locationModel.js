const db = require("../../Database");

class LocationModel {

    async updateLocation(userId, latitude, longitude) {
        const sql = `
            INSERT INTO live_locations (user_id, latitude, longitude)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                latitude = VALUES(latitude),
                longitude = VALUES(longitude),
                updated_at = CURRENT_TIMESTAMP
        `;
       
        await db.promise().query(sql, [userId, latitude, longitude]);
    }
    async getLatestLocation(userId) {
        const sql = `
            SELECT latitude, longitude, updated_at
            FROM live_locations
            WHERE user_id = ?
        `;
        const [rows] = await db.promise().query(sql, [userId]);
        return rows[0];   
    }
}

module.exports = new LocationModel();