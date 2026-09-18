const attendanceModel = require("../models/attendanceModel");
const attendanceService = require("../services/attendanceService");
const timetableModel = require("../models/timetableModel");
const db = require("../../Database");

class AttendanceController {

    // 1. POST /api/attendance/mark
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

            // 1. TIME CHECK
            const timeCheck = attendanceService.checkTime(tt.start_time, tt.end_time);
            if (!timeCheck.time_verified) {
                return res.status(400).json({
                    message: "Not within lecture time",
                    current_time: timeCheck.current_time,
                    allowed_time: tt.start_time + " - " + tt.end_time
                });
            }

            // 2. MO LOCATION CHECK - ✅ TESTING KE LIYE COMMENT OUT KIYA GAYA HAI
            // Jab testing complete ho jaye toh neeche wali lines se /* aur */ hata kar wapis activate kar dein
            /*
            const moCheck = await attendanceService.checkLocation(
                moId, 
                tt.room_lat, 
                tt.room_lng, 
                tt.radius_meters || 500 // Default 500 meters agar DB mein radius na ho
            );

            if (!moCheck.ok) {
                return res.status(400).json({
                    message: "You (MO) are not within the room radius",
                    reason: moCheck.reason,
                    distance: moCheck.distance
                });
            }
            */

            // ✅ Dummy moCheck object taake neeche ka code crash na ho
            const moCheck = {
                ok: true,
                distance: 0,
                lat: 31.5204,
                lng: 74.3587
            };

            const today = new Date().toISOString().split("T")[0];

            // 3. DATABASE INSERT (Teacher location columns hata diye gaye hain)
            const sql = `
                INSERT INTO attendance 
                (timetable_id, date, status, marked_by, mo_lat, mo_lng, location_verified, time_verified, substitute_teacher_name)
                VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)
            `;
            
            const [result] = await db.promise().query(sql, [
                timetable_id,
                today,
                status.toLowerCase(),
                moId,
                moCheck.lat,   // ✅ Dummy latitude
                moCheck.lng,   // ✅ Dummy longitude
                substitute_teacher_name || null
            ]);

            res.status(201).json({
                message: "Attendance marked successfully",
                id: result.insertId,
                mo_distance: moCheck.distance
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

                    // OFFLINE VALIDATION (Haversine Formula for MO Location)
                    const R = 6371e3; 
                    const φ1 = record.mo_lat * Math.PI / 180;
                    const φ2 = tt.room_lat * Math.PI / 180;
                    const Δφ = (tt.room_lat - record.mo_lat) * Math.PI / 180;
                    const Δλ = (tt.room_lng - record.mo_lng) * Math.PI / 180;

                    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                              Math.cos(φ1) * Math.cos(φ2) *
                              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    const distance = R * c; 

                    // Check if within radius
                    if (distance > (tt.radius_meters || 500)) {
                        results.push({ 
                            success: false, 
                            local_id: record.local_id, 
                            error: `MO location invalid. Distance: ${Math.round(distance)}m` 
                        });
                        continue;
                    }

                    // Insert into DB
                    const sql = `
                        INSERT INTO attendance 
                        (timetable_id, date, status, marked_by, mo_lat, mo_lng, location_verified, time_verified, substitute_teacher_name)
                        VALUES (?, ?, ?, ?, ?, ?, 1, 1, ?)
                    `;
                    
                    await db.promise().query(sql, [
                        record.timetable_id,
                        record.date || today,
                        record.status.toLowerCase(),
                        moId,
                        record.mo_lat,
                        record.mo_lng,
                        record.substitute_teacher_name || null
                    ]);

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
            const today = new Date().toISOString().split("T")[0];
            const rows = await attendanceModel.getByDate(today);
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