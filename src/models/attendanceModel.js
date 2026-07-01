const db = require("../../Database");

const createAttendance = (attendanceData, callback) => {

    const sql = `
        INSERT INTO attendance
        (
            timetable_id,
            teacher_id,
            monitor_id,
            status,
            latitude,
            longitude,
            sync_status,
            marked_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            attendanceData.timetable_id,
            attendanceData.teacher_id,
            attendanceData.monitor_id,
            attendanceData.status,
            attendanceData.latitude,
            attendanceData.longitude,
            attendanceData.sync_status,
            attendanceData.marked_at
        ],
        callback
    );
};

const getAllAttendance = (callback) => {

    const sql = `
        SELECT *
        FROM attendance
        ORDER BY attendance_id DESC
    `;

    db.query(sql, callback);
};

const getTimetableById = (timetable_id, callback) => {

    const sql = `
        SELECT *
        FROM timetable
        WHERE timetable_id = ?
    `;

    db.query(sql, [timetable_id], callback);
};

const getRoomById = (room_id, callback) => {

    const sql = `
        SELECT *
        FROM rooms
        WHERE room_id = ?
    `;

    db.query(sql, [room_id], callback);
};

module.exports = {
    createAttendance,
    getAllAttendance,
    getTimetableById,
    getRoomById
};