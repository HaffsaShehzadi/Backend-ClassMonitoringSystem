const attendanceModel = require("../models/attendanceModel");
const attendanceService = require("../services/attendanceService");
const timetableModel = require("../models/timetableModel");
const locationService = require("../services/locationService");
const locationModel = require("../models/locationModel");

class AttendanceController {
    // 1. POST /api/attendance/mark
    async markAttendance(req, res) {
        try {
            const { timetable_id, status, substitute_teacher_name, latitude, longitude, date } = req.body;
            const moId = req.user.user_id;

            // 1. Basic Validation
            if (!timetable_id || !status) {
                return res.status(400).json({ message: "timetable_id and status are required" });
            }

            // 2. Timetable Check
            const tt = await timetableModel.getById(timetable_id);
            if (!tt) {
                return res.status(404).json({ message: "Timetable not found" });
            }

            // 3. TIME CHECK
            const timeCheck = attendanceService.checkTime(tt.start_time, tt.end_time);
            if (!timeCheck.time_verified) {
                return res.status(400).json({
                    message: "Not within lecture time",
                    current_time: timeCheck.current_time,
                    allowed_time: `${tt.start_time} - ${tt.end_time}`
                });
            }

            // 4. MO LOCATION CHECK (Live GPS Verification)
            let moLat = latitude;
            let moLng = longitude;
            // Fallback: If coordinates not in body, check live_locations
            if (moLat === undefined || moLng === undefined) {
                const loc = await locationModel.getLatestLocation(moId);
                if (loc) {
                    moLat = loc.latitude;
                    moLng = loc.longitude;
                }
            }
            if (moLat === undefined || moLng === undefined) {
                return res.status(400).json({ message: "GPS Location is required to mark attendance" });
            }

            // 5. Verify distance if room coordinates exist in DB
            let distance = 0;
            let locationVerified = 1; // Default true if no room coords are set in DB  
            if (tt.room_lat && tt.room_lng) {
                distance = locationService.calculateDistance(moLat, moLng, tt.room_lat, tt.room_lng);
                const allowedRadius = Math.max(tt.radius_meters || 10, 50);
                if (!locationService.isWithinRadius(distance, allowedRadius)) {
                    return res.status(400).json({
                        message: `You (MO) are not within the room radius. Distance: ${Math.round(distance)}m (Allowed: ${allowedRadius}m)`,
                        distance: Math.round(distance),
                        allowed_radius: allowedRadius
                    });
                }
            }

            const today = date || new Date().toISOString().split("T")[0];

            // 6. Check if attendance already marked for this class today via Model (Prevent duplicates!)
            const existingAttendance = await attendanceModel.findByTimetableAndDate(timetable_id, today);
            if (existingAttendance) {
                return res.status(400).json({
                    message: "Attendance has already been marked for this class today."
                });
            }

            // 7. USE THE MODEL (Clean MVC Approach)
            const attendanceData = {
                timetable_id: timetable_id,
                date: today,
                status: status.toLowerCase(),
                marked_by: moId,
                mo_lat: moLat,
                mo_lng: moLng,
                location_verified: locationVerified,
                time_verified: 1,
                substitute_teacher_name: substitute_teacher_name || null
            };

            const attendanceId = await attendanceModel.markAttendance(attendanceData);
            console.log(`✅ Attendance inserted (id: ${attendanceId}) for timetable: ${timetable_id}`);

            // 8. Success Response
            res.status(201).json({
                message: "Attendance marked successfully",
                id: attendanceId,
                mo_distance: Math.round(distance)
            });

        } catch (error) {
            console.error("❌ Mark Attendance Error:", error);
            res.status(500).json({ message: "Server error: " + error.message });
        }
    }

    // 2. POST /api/attendance/sync-offline
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
                    // 1. Timetable Check
                    const tt = await timetableModel.getById(record.timetable_id);
                    if (!tt) {
                        results.push({ success: false, local_id: record.local_id, error: "Timetable not found" });
                        continue;
                    }

                    // 2. OFFLINE LOCATION VALIDATION (Haversine Formula)
                    let locationVerified = 1;
                    if (tt.room_lat && tt.room_lng && record.mo_lat && record.mo_lng) {
                        const distance = locationService.calculateDistance(
                            record.mo_lat, record.mo_lng, tt.room_lat, tt.room_lng
                        );
                        const allowedRadius = tt.radius_meters || 10;

                        if (!locationService.isWithinRadius(distance, allowedRadius)) {
                            results.push({ 
                                success: false, 
                                local_id: record.local_id, 
                                error: `MO location invalid. Distance: ${Math.round(distance)}m (Allowed: ${allowedRadius}m)` 
                            });
                            continue;
                        }
                        locationVerified = 1;
                    }

                    record.location_verified = locationVerified; 
                    const syncResult = await attendanceModel.upsertOfflineAttendance(record, moId);
                    results.push(syncResult);
                } catch (err) {
                    results.push({ success: false, local_id: record.local_id, error: err.message });
                }
            }

            const successCount = results.filter(r => r.success).length;  
            res.status(201).json({
                message: `Successfully synced ${successCount} out of ${records.length} records`,
                results
            });
        } catch (error) {
            console.error("❌ Sync Offline Error:", error);
            res.status(500).json({ message: "Server error: " + error.message });
        }
    }

    // 3. GET /api/attendance/today
    async getTodayAttendance(req, res) {
        try {
            const date = req.query.date || new Date().toISOString().split("T")[0];
            const rows = await attendanceModel.getByDate(date);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error: " + error.message });
        }
    }

    // 4. GET /api/attendance/my-history
    async getTeacherHistory(req, res) {
        try {
            const teacherId = req.user.user_id;
            const { startDate, endDate, shift } = req.query;
            const rows = await attendanceModel.getByTeacher(teacherId, { startDate, endDate, shift });
            res.json(rows);
        } catch (error) {
            console.error("❌ Teacher History Error:", error);
            res.status(500).json({ message: "Server error: " + error.message });
        }
    }

    // 5. GET /api/attendance/mo-history
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
            console.error("❌ MO History Error:", error);
            res.status(500).json({ message: "Server error: " + error.message });
        }
    }

    // 6. PUT /api/attendance/update/:id
    async updateAttendance(req, res) {
        try {
            const { id } = req.params;
            const { status, substitute_teacher_name } = req.body;

            if (!status || !["present", "absent"].includes(status.toLowerCase())) {
                return res.status(400).json({ message: "Status must be 'present' or 'absent'" });
            }

            await attendanceModel.update(id, { status, substitute_teacher_name });

            res.json({ message: "Attendance updated successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error: " + error.message });
        }
    }
}

module.exports = new AttendanceController();