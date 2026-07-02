const db = require("../../Database");

class LocationModel {

    updateTeacherLocation(data, callback) {

        const sql = `
            INSERT INTO teacher_locations
            (
                teacher_id,
                latitude,
                longitude
            )
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [
                data.teacher_id,
                data.latitude,
                data.longitude
            ],
            callback
        );
    }

    updateMonitorLocation(data, callback) {

        const sql = `
            INSERT INTO monitor_locations
            (
                monitor_id,
                latitude,
                longitude
            )
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [
                data.monitor_id,
                data.latitude,
                data.longitude
            ],
            callback
        );
    }

    getLatestTeacherLocation(
        teacher_id,
        callback
    ) {

        const sql = `
            SELECT *
            FROM teacher_locations
            WHERE teacher_id = ?
            ORDER BY updated_at DESC
            LIMIT 1
        `;

        db.query(
            sql,
            [teacher_id],
            callback
        );
    }

    getLatestMonitorLocation(
        monitor_id,
        callback
    ) {

        console.log("Searching Monitor:", monitor_id);
        const sql = `
            SELECT *
            FROM monitor_locations
            WHERE monitor_id = ?
            ORDER BY updated_at DESC
            LIMIT 1
        `;

        db.query(
            sql,
            [monitor_id],
            callback
        );
    }
}

module.exports = new LocationModel();