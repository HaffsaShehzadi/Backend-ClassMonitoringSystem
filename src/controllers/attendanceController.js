const attendanceModel = require("../models/attendanceModel");
const attendanceService = require("../services/attendanceService");
const timetableModel = require("../models/timetableModel");
const db = require("../../Database");

class AttendanceController {

    // POST /api/attendance/mark
    async markAttendance(req, res) {
        try {
            const { timetable_id, status, substitute_teacher_name } = req.body;
            const moId = req.user.user_id;

            if (!timetable_id || !status) {
                return res.status(400).json({ message: "timetable_id and status required" });
            }

            const tt = await timetableModel.getById(timetable_id);
            if (!tt) {
                return res.status(404).json({ message: "Timetable not found" });
            }

            // TIME CHECK
            const timeCheck = attendanceService.checkTime(tt.start_time, tt.end_time);
            if (!timeCheck.time_verified) {
                return res.status(400).json({
                    message: "Not within lecture time",
                    current_time: timeCheck.current_time,
                    allowed_time: tt.start_time + " - " + tt.end_time
                });
            }

            // MO LOCATION CHECK
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

            // TEACHER LOCATION CHECK (only for present/late)
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

            const today = new Date().toISOString().split("T")[0];

            const id = await attendanceModel.markAttendance({
                timetable_id,
                date: today,
                status,
                substitute_teacher_name: substitute_teacher_name || null, 
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

    // POST /api/attendance/sync-offline
    async syncOfflineAttendance(req, res) {
        try {
            const { records } = req.body;
            const moId = req.user.user_id;

            if (!records || !Array.isArray(records) || records.length === 0) {
                return res.status(400).json({ message: "No records to sync" });
            }

            const results = [];

            for (const record of records) {
                try {
                    const tt = await timetableModel.getById(record.timetable_id);
                    if (!tt) {
                        results.push({ success: false, local_id: record.local_id, error: "Timetable not found" });
                        continue;
                    }

                    // ✅ OFFLINE VALIDATION: Check if saved MO location is within room radius
                    const R = 6371e3; // Earth radius in metres
                    const φ1 = record.mo_lat * Math.PI / 180;
                    const φ2 = tt.room_lat * Math.PI / 180;
                    const Δφ = (tt.room_lat - record.mo_lat) * Math.PI / 180;
                    const Δλ = (tt.room_lng - record.mo_lng) * Math.PI / 180;

                    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                              Math.cos(φ1) * Math.cos(φ2) *
                              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distance = R * c; // Distance in metres

                    // ✅ Agar MO ki saved location room ke radius se bahar hai, toh reject kardo
                    if (distance > tt.radius_meters) {
                        results.push({ 
                            success: false, 
                            local_id: record.local_id, 
                            error: `MO location invalid. Distance: ${Math.round(distance)}m, Allowed: ${tt.radius_meters}m` 
                        });
                        continue;
                    }

                    // ✅ Agar location valid hai, toh database mein save kardo
                    const id = await attendanceModel.markAttendance({
                        timetable_id: record.timetable_id,
                        date: record.date,
                        status: record.status.toLowerCase(),
                        substitute_teacher_name: record.substitute_teacher_name || null,
                        marked_by: moId,
                        teacher_lat: null, // Offline mein teacher ki location nahi hoti
                        teacher_lng: null,
                        mo_lat: record.mo_lat,
                        mo_lng: record.mo_lng,
                        location_verified: 1,
                        time_verified: 1
                    });

                    results.push({ success: true, local_id: record.local_id, server_id: id });
                } catch (err) {
                    results.push({ success: false, local_id: record.local_id, error: err.message });
                }
            }

            const successCount = results.filter(r => r.success).length;
            res.status(201).json({
                message: `Synced ${successCount}/${records.length} offline records`,
                results
            });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/attendance/today
    async getTodayAttendance(req, res) {
        try {
            const today = new Date().toISOString().split("T")[0];
            const rows = await attendanceModel.getByDate(today);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/attendance/my-history
    async getTeacherHistory(req, res) {
        try {
            const teacherId = req.user.user_id;
            const { startDate, endDate, shift } = req.query;
            const rows = await attendanceModel.getByTeacher(teacherId, startDate, endDate, shift);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // GET /api/attendance/mo-history
    async getMOHistory(req, res) {
        try {
            const moId = req.user.user_id;
            const { date, department_id } = req.query;

            if (!date) {
                return res.status(400).json({ message: "Date is required" });
            }

            const rows = await attendanceModel.getMOHistory(moId, date, department_id);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // PUT /api/attendance/update/:id
    async updateAttendance(req, res) {
        try {
            const { id } = req.params;
            const { status, substitute_teacher_name } = req.body;

            if (!status || !["present", "absent"].includes(status.toLowerCase())) {
                return res.status(400).json({ message: "Status must be 'present' or 'absent'" });
            }

            await db.promise().query(
                `UPDATE attendance 
                 SET status = ?, 
                     substitute_teacher_name = ?,
                     updated_at = NOW()
                 WHERE id = ?`,
                [status.toLowerCase(), substitute_teacher_name || null, id]
            );

            res.json({ message: "Attendance updated successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new AttendanceController();