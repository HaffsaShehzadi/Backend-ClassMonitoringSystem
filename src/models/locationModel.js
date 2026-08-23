const db = require("../../Database");

// ============================================
// Location Model - live_locations table handle karta hai
// Teacher + Monitoring OFFICIAL dono ka latest GPS
// isi EK table mein save hota hai
// ============================================
class LocationModel {

    // User ka latest location update karna
    // INSERT ... ON DUPLICATE KEY UPDATE ka matlab:
    //   - User pehle se table mein hai → sirf GPS update karo
    //   - Naya user hai → naya row insert karo
    // Is tarah har user ki sirf EK latest row rehti hai
    async updateLocation(userId, latitude, longitude) {
        const sql = `
            INSERT INTO live_locations (user_id, latitude, longitude)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                latitude = VALUES(latitude),
                longitude = VALUES(longitude)
        `;
        // Note: updated_at khud-ba-khud update hota hai
        // (table mein ON UPDATE CURRENT_TIMESTAMP laga hai)
        await db.promise().query(sql, [userId, latitude, longitude]);
    }

    // Kisi user ka latest location lana
    // Har user ki ek hi row hai, is liye ORDER BY ki zarurat nahi
    async getLatestLocation(userId) {
        const sql = `
            SELECT latitude, longitude, updated_at
            FROM live_locations
            WHERE user_id = ?
        `;
        const [rows] = await db.promise().query(sql, [userId]);
        return rows[0];   // user ki latest location (ya undefined)
    }
}

module.exports = new LocationModel();