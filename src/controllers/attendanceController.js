const attendanceModel = require("../models/attendanceModel");
const attendanceService = require("../services/attendanceService");
const timetableModel = require("../models/timetableModel");
const db = require("../../Database");

// Attendance Controller - marking + history
class AttendanceController {

    // POST /api/attendance/mark
    // MO attendance mark karta hai - yahan SARI validation hoti hai
    async markAttendance(req, res) {
        try {
            const { timetable_id, status, substitute_teacher_id } = req.body;
            const moId = req.user.user_id;

            if (!timetable_id || !status) {
                return res.status(400).json({ message: "timetable_id and status required" });
            }

            // Timetable ki poori maloomat (room GPS + period time + teacher_id)
            const tt = await timetableModel.getById(timetable_id);
            if (!tt) {
                return res.status(404).json({ message: "Timetable not found" });
            }

            // TIME CHECK - lecture ke time mein hi mark ho sakti hai
            const timeCheck = attendanceService.checkTime(tt.start_time, tt.end_time);
            if (!timeCheck.time_verified) {
                return res.status(400).json({
                    message: "Not within lecture time",
                    current_time: timeCheck.current_time,
                    allowed_time: tt.start_time + " - " + tt.end_time
                });
            }

            // MO LOCATION CHECK - MO ka room mein hona zaroori hai
            const moCheck = await attendanceService.checkLocation(
                moId, tt.room_lat, tt.room_lng, tt.radius_meters
            );
            if (!moCheck.ok) {
                return res.status(400).json({
                    message: "You (MO) are not within the room radius",
                    reason: moCheck.reason,
                    distance: moCheck.distance
                });
            }

            // TEACHER LOCATION CHECK - sirf present/late pe
            // (absent pe teacher room mein hota hi nahi - is liye skip)
            let teacherCheck = { ok: true, lat: null, lng: null, distance: null };
            if (status !== "absent") {
                teacherCheck = await attendanceService.checkLocation(
                    tt.teacher_id, tt.room_lat, tt.room_lng, tt.radius_meters
                );
                if (!teacherCheck.ok) {
                    return res.status(400).json({
                        message: "Teacher is not within the room radius",
                        reason: teacherCheck.reason,
                        distance: teacherCheck.distance
                    });
                }
            }

            // Sab checks pass → attendance save (proof ke saath)
            const today = new Date().toISOString().split("T")[0];

            const id = await attendanceModel.markAttendance({
                timetable_id,
                date: today,
                status,
                substitute_teacher_id,
                marked_by: moId,
                teacher_lat: teacherCheck.lat,
                teacher_lng: teacherCheck.lng,
                mo_lat: moCheck.lat,
                mo_lng: moCheck.lng,
                location_verified: 1,
                time_verified: 1
            });

            res.status(201).json({
                message: "Attendance marked successfully",
                id,
                mo_distance: moCheck.distance,
                teacher_distance: teacherCheck.distance
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/attendance/today - aaj ki sari attendance
    async getTodayAttendance(req, res) {
        try {
            const today = new Date().toISOString().split("T")[0];
            const rows = await attendanceModel.getByDate(today);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/attendance/my-history - teacher ki apni history
    async getTeacherHistory(req, res) {
        try {
            const rows = await attendanceModel.getByTeacher(req.user.user_id);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // PUT /api/attendance/update/:id
    // Admin attendance edit kar sakta hai
    async updateAttendance(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Sirf present ya absent allowed hai
        if (!["present", "absent"].includes(status)) {
            return res.status(400).json({ message: "Status must be present or absent" });
        }

        await db.promise().query(
            "UPDATE attendance SET status = ? WHERE id = ?",
            [status, id]
        );

        res.json({ message: "Attendance updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
}

module.exports = new AttendanceController();