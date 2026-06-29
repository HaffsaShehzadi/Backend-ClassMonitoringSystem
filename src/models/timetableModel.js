const db = require("../../Database");

const createTimetable = (timetableData, callback) => {

    const sql = `
        INSERT INTO timetable
        (
            lecture_date,
            day_name,
            lecture_no,
            start_time,
            end_time,
            room_id,
            teacher_id,
            department_id,
            semester_no,
            subject_name
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            timetableData.lecture_date,
            timetableData.day_name,
            timetableData.lecture_no,
            timetableData.start_time,
            timetableData.end_time,
            timetableData.room_id,
            timetableData.teacher_id,
            timetableData.department_id,
            timetableData.semester_no,
            timetableData.subject_name
        ],
        callback
    );
};

const getAllTimetables = (callback) => {

    const sql = `
        SELECT *
        FROM timetable
        ORDER BY timetable_id DESC
    `;

    db.query(sql, callback);
};

const updateTimetable = (id, timetableData, callback) => {

    const sql = `
        UPDATE timetable
        SET
            lecture_date = ?,
            day_name = ?,
            lecture_no = ?,
            start_time = ?,
            end_time = ?,
            room_id = ?,
            teacher_id = ?,
            department_id = ?,
            semester_no = ?,
            subject_name = ?
        WHERE timetable_id = ?
    `;

    db.query(
        sql,
        [
            timetableData.lecture_date,
            timetableData.day_name,
            timetableData.lecture_no,
            timetableData.start_time,
            timetableData.end_time,
            timetableData.room_id,
            timetableData.teacher_id,
            timetableData.department_id,
            timetableData.semester_no,
            timetableData.subject_name,
            id
        ],
        callback
    );
};

const deleteTimetable = (id, callback) => {

    const sql = `
        DELETE FROM timetable
        WHERE timetable_id = ?
    `;

    db.query(sql, [id], callback);
};

module.exports = {
    createTimetable,
    getAllTimetables
};

module.exports = {
    createTimetable,
    getAllTimetables,
    updateTimetable,
    deleteTimetable
};