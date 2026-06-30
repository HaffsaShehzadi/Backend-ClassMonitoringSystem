const attendanceModel =
require("../models/attendanceModel");

exports.createAttendance = (req, res) => {

    const {
        timetable_id,
        teacher_id,
        status,
        latitude,
        longitude
    } = req.body;

    const monitor_id = req.user.user_id;

    attendanceModel.createAttendance(
        {
            timetable_id,
            teacher_id,
            monitor_id,
            status,
            latitude,
            longitude,
            sync_status: "Synced",
            marked_at: new Date()
        },
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message:
                "Attendance Marked Successfully",
                monitor_id
            });
        }
    );
};

exports.getAllAttendance = (req, res) => {

    attendanceModel.getAllAttendance(
        (err, rows) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(rows);
        }
    );
};