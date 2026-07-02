const attendanceModel = require("../models/attendanceModel");
const locationModel = require("../models/locationModel");
const attendanceService = require("../services/AttendanceService");

exports.createAttendance = (req, res) => {

    const {
        timetable_id,
        teacher_id,
        status
    } = req.body;

    const monitor_id = req.user.user_id;
    console.log("=================================");
    console.log("JWT User:", req.user);
    console.log("Monitor ID:", monitor_id);

    attendanceModel.getTimetableById(
        timetable_id,
        (err, timetableRows) => {

            if (err) {
                return res.status(500)
                .json(err);
            }

            if (
                timetableRows.length === 0
            ) {
                return res.status(404)
                .json({
                    message:
                    "Timetable Not Found"
                });
            }

            const timetable =
            timetableRows[0];

            attendanceModel.getRoomById(
                timetable.room_id,
                (err, roomRows) => {

                    if (err) {
                        return res.status(500)
                        .json(err);
                    }

                    const room =
                    roomRows[0];

                    locationModel.getLatestTeacherLocation(
                        teacher_id,
                        (err, teacherRows) => {

                            if (err) {
                                return res.status(500)
                                .json(err);
                            }

                            if (
                                teacherRows.length === 0
                            ) {
                                return res.status(404)
                                .json({
                                    message:
                                    "Teacher Location Not Found"
                                });
                            }

                            const teacherLocation =
                            teacherRows[0];

                            locationModel.getLatestMonitorLocation(
                                monitor_id,
                                (
                                    err,
                                    monitorRows
                                ) => {

                                    console.log("Rows Returned:", monitorRows);
                                    if (err) {
                                        return res.status(500)
                                        .json(err);
                                    }

                                    if (
                                        monitorRows.length === 0
                                    ) {
                                        return res.status(404)
                                        .json({
                                            message:
                                            "Monitor Location Not Found"
                                        });
                                    }

                                    const monitorLocation =
                                    monitorRows[0];

                                    const teacherDistance =
                                    attendanceService.calculateDistance(
                                        room.latitude,
                                        room.longitude,
                                        teacherLocation.latitude,
                                        teacherLocation.longitude
                                    );

                                    const monitorDistance =
                                    attendanceService.calculateDistance(
                                        room.latitude,
                                        room.longitude,
                                        monitorLocation.latitude,
                                        monitorLocation.longitude
                                    );

                                    let validationStatus =
                                    "Invalid";

                                    if (
                                        teacherDistance <= room.radius &&
                                        monitorDistance <= room.radius
                                    ) {
                                        validationStatus =
                                        "Valid";
                                    }

                                    attendanceModel.createAttendance(
                                        {
                                            timetable_id,
                                            teacher_id,
                                            monitor_id,

                                            status,

                                            sync_status:
                                            "Synced",

                                            marked_at:
                                            new Date(),

                                            teacher_latitude:
                                            teacherLocation.latitude,

                                            teacher_longitude:
                                            teacherLocation.longitude,

                                            monitor_latitude:
                                            monitorLocation.latitude,

                                            monitor_longitude:
                                            monitorLocation.longitude,

                                            validation_status:
                                            validationStatus
                                        },

                                        (
                                            err,
                                            result
                                        ) => {

                                            if (err) {
                                                return res.status(500)
                                                .json(err);
                                            }

                                            res.status(201)
                                            .json({

                                                message:
                                                "Attendance Processed",

                                                validation_status:
                                                validationStatus,

                                                teacher_distance:
                                                teacherDistance,

                                                monitor_distance:
                                                monitorDistance,

                                                room_radius:
                                                room.radius
                                            });
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
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