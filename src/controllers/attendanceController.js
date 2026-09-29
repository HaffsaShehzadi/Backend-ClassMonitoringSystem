const attendanceModel = require("../models/attendanceModel");
const attendanceService = require("../services/attendanceService");
const timetableModel = require("../models/timetableModel");
const locationService = require("../services/locationService");
const locationModel = require("../models/locationModel");
const db = require("../../Database");

class AttendanceController {

    // 1. POST /api/attendance/mark
    async markAttendance(req, res) {
        try {
            const { timetable_id, status, substitute_teacher_name, latitude, longitude } = req.body;
            const moId = req.user.user_id;

            if (!timetable_id || !status) {
                return res.status(400).json({ message: "timetable_id and status required" });
            }

            const tt = await timetableModel.getById(timetable_id);
            if (!tt) {
                return res.status(404).json({ message: "Timetable not found" });
            }

            // 1. TIME CHECK
            const timeCheck = attendanceService.checkTime(tt.start_time, tt.end_time);
            if (!timeCheck.time_verified) {
                return res.status(400).json({
                    message: "Not within lecture time",
                    current_time: timeCheck.current_time,
                    allowed_time: tt.start_time + " - " + tt.end_time
                });
            }

            // 2. MO LOCATION CHECK (Live GPS Verification)
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
                return res.status(400).json({
                    message: "GPS Location is required to mark attendance"
                });
            }

            // Verify distance if room coordinates exist in DB
            let distance = 0;
            let locationVerified = 1;
            if (tt.room_lat && tt.room_lng) {
                distance = locationService.calculateDistance(moLat, moLng, tt.room_lat, tt.room_lng);
                const allowedRadius = tt.radius_meters || 50;

                if (!locationService.isWithinRadius(distance, allowedRadius)) {
                    return res.status(400).json({
                        message: `You (MO) are not within the room radius. Distance: ${Math.round(distance)}m (Allowed: ${allowedRadius}m)`,
                        distance: Math.round(distance),
                        allowed_radius: allowedRadius
                    });
                }
                locationVerified = 1;
            }

            const today = req.body.date || new Date().toISOString().split("T")[0];

            // 3. Check if attendance already marked for this class today (Prevent duplicates!)
            const [existingRows] = await db.promise().query(
                "SELECT id FROM attendance WHERE timetable_id = ? AND date = ?",
                [timetable_id, today]
            );

            if (existingRows.length > 0) {
                return res.status(400).json({
                    message: "Attendance has already been marked for this class today."
                });
            }

            // Insert new record
            const sql = `
                INSERT INTO attendance 
                (timetable_id, date, status, marked_by, mo_lat, mo_lng, location_verified, time_verified, substitute_teacher_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
            `;
            const [result] = await db.promise().query(sql, [
                timetable_id,
                today,
                status.toLowerCase(),
                moId,
                moLat,
                moLng,
                locationVerified,
                substitute_teacher_name || null
            ]);
            const attendanceId = result.insertId;
            console.log(`✅ Attendance inserted (id: ${attendanceId}) for timetable: ${timetable_id}`);

            res.status(201).json({
                message: existingRows.length > 0 ? "Attendance updated successfully" : "Attendance marked successfully",
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
            const today = new Date().toISOString().split("T")[0];

            for (const record of records) {
                try {
                    const tt = await timetableModel.getById(record.timetable_id);
                    if (!tt) {
                        results.push({ success: false, local_id: record.local_id, error: "Timetable not found" });
                        continue;
                    }

                    // OFFLINE LOCATION VALIDATION (Haversine Formula via LocationService)
                    let locationVerified = 1;
                    if (tt.room_lat && tt.room_lng) {
                        const distance = locationService.calculateDistance(
                            record.mo_lat, 
                            record.mo_lng, 
                            tt.room_lat, 
                            tt.room_lng
                        );
                        const allowedRadius = tt.radius_meters || 50;

                        // Check if within radius
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

                    // Check if record already exists for this timetable and date to prevent duplicates
                    const recordDate = record.date || today;
                    const [existingRows] = await db.promise().query(
                        "SELECT id FROM attendance WHERE timetable_id = ? AND date = ?",
                        [record.timetable_id, recordDate]
                    );

                    if (existingRows.length > 0) {
                        const updateSql = `
                            UPDATE attendance 
                            SET status = ?, marked_by = ?, mo_lat = ?, mo_lng = ?, 
                                location_verified = ?, time_verified = 1, substitute_teacher_name = ?, marked_at = CURRENT_TIMESTAMP
                            WHERE id = ?
                        `;
                        await db.promise().query(updateSql, [
                            record.status.toLowerCase(),
                            moId,
                            record.mo_lat,
                            record.mo_lng,
                            locationVerified,
                            record.substitute_teacher_name || null,
                            existingRows[0].id
                        ]);
                    } else {
                        const sql = `
                            INSERT INTO attendance 
                            (timetable_id, date, status, marked_by, mo_lat, mo_lng, location_verified, time_verified, substitute_teacher_name)
                            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                        `;
                        await db.promise().query(sql, [
                            record.timetable_id,
                            recordDate,
                            record.status.toLowerCase(),
                            moId,
                            record.mo_lat,
                            record.mo_lng,
                            locationVerified,
                            record.substitute_teacher_name || null
                        ]);
                    }

                    results.push({ success: true, local_id: record.local_id });
                } catch (err) {
                    results.push({ success: false, local_id: record.local_id, error: err.message });
                }
            }

            res.status(201).json({
                message: `Synced ${results.filter(r => r.success).length} records`,
                results
            });
        } catch (error) {
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
        // 4. GET /api/attendance/my-history
    async getTeacherHistory(req, res) {
        try {
            const teacherId = req.user.user_id;
            const { startDate, endDate, shift } = req.query;
            
            // ✅ FIXED: users table ko JOIN kiya gaya hai
            let sql = `
                SELECT a.*, u.name as teacher_name, t.subject_code, d.dept_name, t.semester, t.period_id as period_number
                FROM attendance a
                JOIN timetable t ON a.timetable_id = t.id
                JOIN departments d ON t.department_id = d.id
                LEFT JOIN users u ON t.teacher_id = u.id
                WHERE t.teacher_id = ?
            `;
            const params = [teacherId];

            if (startDate && endDate) {
                sql += ` AND a.date BETWEEN ? AND ?`;
                params.push(startDate, endDate);
            }

            const [rows] = await db.promise().query(sql, params);
            res.json(rows);
        } catch (error) {
            console.error("❌ Teacher History Error:", error);
            res.status(500).json({ message: "Server error: " + error.message });
        }
    }

    // 5. GET /api/attendance/mo-history
    // 5. GET /api/attendance/mo-history
    // 5. GET /api/attendance/mo-history
    async getMOHistory(req, res) {
        try {
            const moId = req.user.user_id;
            const { date, department_id } = req.query;

            if (!date) {
                return res.status(400).json({ message: "Date is required" });
            }

            // ✅ FIXED: t.semester aur t.period_id ko SELECT mein add kar diya gaya hai
            let sql = `
                SELECT a.*, u.name as teacher_name, t.subject_code, t.semester, t.period_id as period_number, d.dept_name 
                FROM attendance a
                JOIN timetable t ON a.timetable_id = t.id
                JOIN departments d ON t.department_id = d.id
                LEFT JOIN users u ON t.teacher_id = u.id
                WHERE a.marked_by = ? AND a.date = ?
            `;
            const params = [moId, date];

            if (department_id) {
                sql += ` AND t.department_id = ?`;
                params.push(department_id);
            }

            const [rows] = await db.promise().query(sql, params);
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

            await db.promise().query(
                `UPDATE attendance SET status = ?, substitute_teacher_name = ? WHERE id = ?`,
                [status.toLowerCase(), substitute_teacher_name || null, id]
            );

            res.json({ message: "Attendance updated successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error: " + error.message });
        }
    }
}

module.exports = new AttendanceController();