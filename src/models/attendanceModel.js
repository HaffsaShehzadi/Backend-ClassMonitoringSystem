const db = require("../../Database");

class AttendanceModel {

    createAttendance(attendanceData, callback) {

        const sql = `
            INSERT INTO attendance
            (
                timetable_id,
                teacher_id,
                monitor_id,
                status,
                sync_status,
                marked_at,
                teacher_latitude,
                teacher_longitude,
                monitor_latitude,
                monitor_longitude,
                validation_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                attendanceData.timetable_id,
                attendanceData.teacher_id,
                attendanceData.monitor_id,
                attendanceData.status,
                attendanceData.sync_status,
                attendanceData.marked_at,
                attendanceData.teacher_latitude,
                attendanceData.teacher_longitude,
                attendanceData.monitor_latitude,
                attendanceData.monitor_longitude,
                attendanceData.validation_status
            ],
            callback
        );
    }

    getAllAttendance(callback) {

        const sql = `
            SELECT *
            FROM attendance
            ORDER BY attendance_id DESC
        `;

        db.query(sql, callback);
    }

    getTimetableById(timetable_id, callback) {

        const sql = `
            SELECT *
            FROM timetable
            WHERE timetable_id = ?
        `;

        db.query(sql, [timetable_id], callback);
    }

    getRoomById(room_id, callback) {

        const sql = `
            SELECT *
            FROM rooms
            WHERE room_id = ?
        `;

        db.query(sql, [room_id], callback);
    }
}

module.exports = new AttendanceModel();