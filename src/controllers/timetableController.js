const timetableModel = require("../models/timetableModel");
const db = require("../../Database");

// ✅ HELPER FUNCTION: 12-hour (AM/PM) ko MySQL ke 24-hour (HH:MM:SS) format mein badalne ke liye
const parseTimeTo24Hour = (timeStr) => {
    if (!timeStr) return '00:00:00';
    
    const cleanTime = String(timeStr).trim().toUpperCase();
    
    // Check if it has AM/PM
    if (cleanTime.includes('AM') || cleanTime.includes('PM')) {
        const isPM = cleanTime.includes('PM');
        const timePart = cleanTime.replace('AM', '').replace('PM', '').trim();
        const parts = timePart.split(':');
        
        let hours = parseInt(parts[0], 10);
        let minutes = parts[1] ? parts[1].padStart(2, '0') : '00';
        
        if (isNaN(hours)) return '00:00:00';
        
        // Convert to 24-hour
        if (isPM && hours < 12) {
            hours += 12;
        }
        if (!isPM && hours === 12) {
            hours = 0;
        }
        
        return `${String(hours).padStart(2, '0')}:${minutes}:00`;
    }
    
    // If already 24-hour format (e.g., "13:00" or "13:00:00")
    const parts = cleanTime.split(':');
    if (parts.length >= 2) {
        const h = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        return `${h}:${m}:00`;
    }
    
    return '00:00:00';
};

class TimetableController {

    async getAll(req, res) {
        try {
            const rows = await timetableModel.getAll();
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async getByDayAndShift(req, res) {
        try {
            const { day, shift } = req.query;
            if (!day || !shift) return res.status(400).json({ message: "day and shift required" });
            const rows = await timetableModel.getByDayAndShift(day, shift);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { teacher_name, room_no, department_name, subject_code, semester, day, period_number, shift } = req.body;
            if (!teacher_name || !room_no || !department_name || !subject_code || !semester || !day || !period_number || !shift) {
                return res.status(400).json({ message: "All fields are required" });
            }

            const [teacherRows] = await db.promise().query("SELECT id FROM users WHERE name = ? AND role = 'teacher'", [teacher_name]);
            if (teacherRows.length === 0) return res.status(400).json({ message: "Teacher not found." });
            const teacher_id = teacherRows[0].id;

            const [roomRows] = await db.promise().query("SELECT id FROM rooms WHERE room_no = ?", [room_no]);
            if (roomRows.length === 0) return res.status(400).json({ message: "Room not found." });
            const room_id = roomRows[0].id;

            const [deptRows] = await db.promise().query("SELECT id FROM departments WHERE dept_name = ?", [department_name]);
            if (deptRows.length === 0) return res.status(400).json({ message: "Department not found." });
            const department_id = deptRows[0].id;

            // ✅ FIXED: Database mein Monday-Thursday ke liye 'Regular' save hota hai, Friday ke liye 'Friday'
            const periodDay = day === 'Friday' ? 'Friday' : 'Regular';

            const [periodRows] = await db.promise().query(
                "SELECT id FROM periods WHERE period_number = ? AND shift = ? AND day = ?", 
                [period_number, shift, periodDay]
            );
            if (periodRows.length === 0) return res.status(400).json({ message: `Period not found for shift: ${shift} and day: ${periodDay}.` });
            const period_id = periodRows[0].id;

            const [teacherConflict] = await db.promise().query(
                `SELECT t.id, u.name AS teacher_name, p.start_time, p.end_time FROM timetable t
                 JOIN users u ON t.teacher_id = u.id JOIN periods p ON t.period_id = p.id
                 WHERE t.teacher_id = ? AND t.day = ? AND t.period_id = ? AND t.semester = ?`,
                [teacher_id, day, period_id, semester]
            );
            if (teacherConflict.length > 0) {
                return res.status(400).json({ message: "Teacher already has a class at this time", conflict: { teacher_name: teacherConflict[0].teacher_name, time: `${teacherConflict[0].start_time} - ${teacherConflict[0].end_time}` } });
            }

            const [roomConflict] = await db.promise().query(
                `SELECT t.id, r.room_no, p.start_time, p.end_time FROM timetable t
                 JOIN rooms r ON t.room_id = r.id JOIN periods p ON t.period_id = p.id
                 WHERE t.room_id = ? AND t.day = ? AND t.period_id = ? AND t.semester = ?`,
                [room_id, day, period_id, semester]
            );
            if (roomConflict.length > 0) {
                return res.status(400).json({ message: "Room is already booked at this time", conflict: { room_no: roomConflict[0].room_no, time: `${roomConflict[0].start_time} - ${roomConflict[0].end_time}` } });
            }

            const id = await timetableModel.create({ department_id, semester, day, period_id, teacher_id, subject_code, room_id });
            res.status(201).json({ message: "Class added to timetable", id });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async update(req, res) {
        try {
            // ✅ FIXED: shift ko bhi extract karein
            const { teacher_name, room_no, department_name, subject_code, semester, day, period_number, shift } = req.body;
            const timetableId = req.params.id;

            const [teacherRows] = await db.promise().query("SELECT id FROM users WHERE name = ? AND role = 'teacher'", [teacher_name]);
            const teacher_id = teacherRows.length > 0 ? teacherRows[0].id : null;

            const [roomRows] = await db.promise().query("SELECT id FROM rooms WHERE room_no = ?", [room_no]);
            const room_id = roomRows.length > 0 ? roomRows[0].id : null;

            const [deptRows] = await db.promise().query("SELECT id FROM departments WHERE dept_name = ?", [department_name]);
            const department_id = deptRows.length > 0 ? deptRows[0].id : null;

            // ✅ FIXED: Database mein Monday-Thursday ke liye 'Regular' save hota hai
            const periodDay = day === 'Friday' ? 'Friday' : 'Regular';

            const [periodRows] = await db.promise().query(
                "SELECT id FROM periods WHERE period_number = ? AND shift = ? AND day = ?", 
                [period_number, shift, periodDay]
            );
            const period_id = periodRows.length > 0 ? periodRows[0].id : null;

            if (teacher_id && day && period_id) {
                const [teacherConflict] = await db.promise().query(
                    `SELECT t.id, u.name AS teacher_name, p.start_time, p.end_time FROM timetable t
                     JOIN users u ON t.teacher_id = u.id JOIN periods p ON t.period_id = p.id
                     WHERE t.teacher_id = ? AND t.day = ? AND t.period_id = ? AND t.semester = ? AND t.id != ?`, 
                    [teacher_id, day, period_id, semester, timetableId]
                );
                if (teacherConflict.length > 0) {
                    return res.status(400).json({ message: "Teacher already has a class at this time", conflict: { teacher_name: teacherConflict[0].teacher_name, time: `${teacherConflict[0].start_time} - ${teacherConflict[0].end_time}` } });
                }
            }

            if (room_id && day && period_id) {
                const [roomConflict] = await db.promise().query(
                    `SELECT t.id, r.room_no, p.start_time, p.end_time FROM timetable t
                     JOIN rooms r ON t.room_id = r.id JOIN periods p ON t.period_id = p.id
                     WHERE t.room_id = ? AND t.day = ? AND t.period_id = ? AND t.semester = ? AND t.id != ?`, 
                    [room_id, day, period_id, semester, timetableId]
                );
                if (roomConflict.length > 0) {
                    return res.status(400).json({ message: "Room is already booked at this time", conflict: { room_no: roomConflict[0].room_no, time: `${roomConflict[0].start_time} - ${roomConflict[0].end_time}` } });
                }
            }

            await timetableModel.update(timetableId, { department_id, semester, day, period_id, teacher_id, subject_code, room_id });
            res.json({ message: "Timetable updated" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async remove(req, res) {
        try {
            await timetableModel.remove(req.params.id);
            res.json({ message: "Class removed from timetable" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // ✅ FIXED: getConfig function jo double AM/PM ko hamesha ke liye rok dega
    async getConfig(req, res) {
        try {
            const [depts] = await db.promise().query("SELECT DISTINCT dept_name as name FROM departments ORDER BY dept_name");
            const [configSems] = await db.promise().query("SELECT name FROM timetable_config WHERE config_type = 'semester'");
            const [periods] = await db.promise().query("SELECT id, period_number, start_time, end_time, shift, day FROM periods ORDER BY period_number");

            const departments = depts.map(d => d.name).length > 0 ? depts.map(d => d.name) : ['IT', 'BSCS', 'Math', 'Physics', 'English', 'Urdu', 'Islamiat', 'Zoology', 'Economics', 'Political Science', 'Chemistry'];
            
            let allSems = configSems.map(c => c.name).filter(Boolean);
            if (allSems.length === 0) {
                allSems = ['2nd', '4th', '6th', '8th'];
                for (const sem of allSems) {
                    await db.promise().query("INSERT IGNORE INTO timetable_config (config_type, name) VALUES ('semester', ?)", [sem]);
                }
            } else {
                allSems = allSems.sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));
            }

            const formattedPeriods = periods.map(p => {
                const cleanTime = (timeStr) => {
                    if (!timeStr) return '00:00 AM';
                    
                    const timeString = String(timeStr).trim().toUpperCase();
                    
                    // ✅ AGAR PEHLE SE AM/PM HAI, TOH WAISAY HI RETURN KAR DO (Double AM/PM roknay ke liye)
                    if (timeString.includes(' AM') || timeString.includes(' PM')) {
                        return timeString;
                    }
                    
                    // ✅ AGAR 24-HOUR HAI (e.g., 13:00:00), TOH 12-HOUR BANAO
                    const clean24 = timeString.substring(0, 5);
                    const [h, m] = clean24.split(':').map(Number);
                    
                    if (isNaN(h) || isNaN(m)) return '00:00 AM';
                    
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    const h12 = h % 12 || 12;
                    
                    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
                };
                
                const start = cleanTime(p.start_time);
                const end = cleanTime(p.end_time);
                
                return {
                    id: p.id,
                    period_number: p.period_number,
                    shift: p.shift,
                    day: p.day || 'Regular',
                    time: `${start} - ${end}`
                };
            });

            res.json({ departments, semesters: allSems, periods: formattedPeriods });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async addSemester(req, res) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: "Semester name is required" });
            const [existing] = await db.promise().query("SELECT id FROM timetable_config WHERE config_type = 'semester' AND name = ?", [name]);
            if (existing.length > 0) return res.status(400).json({ message: "Semester already exists" });
            
            await db.promise().query("INSERT INTO timetable_config (config_type, name) VALUES ('semester', ?)", [name]);
            res.status(201).json({ message: "Semester added successfully", name });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async removeSemester(req, res) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: "Semester name is required" });
            await db.promise().query("DELETE FROM timetable_config WHERE config_type = 'semester' AND name = ?", [name]);
            res.json({ message: "Semester removed successfully", name });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async renameSemester(req, res) {
        try {
            const { oldName, newName } = req.body;
            if (!oldName || !newName) return res.status(400).json({ message: "oldName and newName are required" });
            
            const [existing] = await db.promise().query("SELECT id FROM timetable_config WHERE config_type = 'semester' AND name = ?", [newName]);
            if (existing.length > 0) return res.status(400).json({ message: "New semester name already exists" });
            
            await db.promise().query("UPDATE timetable_config SET name = ? WHERE config_type = 'semester' AND name = ?", [newName, oldName]);
            res.json({ message: "Semester renamed successfully", oldName, newName });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // ✅ FIXED: Period Add karna (Time ko 24-hour format mein convert kar ke bhejega)
    async addPeriod(req, res) {
        try {
            const { id, start_time, end_time, shift, day = 'Regular' } = req.body;
            
            const finalShift = shift || '1st Shift';
            const finalDay = day || 'Regular';

            const dbStartTime = parseTimeTo24Hour(start_time);
            const dbEndTime = parseTimeTo24Hour(end_time);

            console.log("📥 Adding Period (Converted):", { id, start_time: dbStartTime, end_time: dbEndTime, shift: finalShift, day: finalDay });

            await db.promise().query(
                "INSERT INTO periods (period_number, start_time, end_time, shift, day) VALUES (?, ?, ?, ?, ?)", 
                [id, dbStartTime, dbEndTime, finalShift, finalDay]
            );
            res.status(201).json({ message: "Period added successfully" });
        } catch (error) {
            console.error("❌ ADD PERIOD ERROR:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    // ✅ FIXED: Period Update karna (Time ko 24-hour format mein convert kar ke bhejega)
    async updatePeriod(req, res) {
        try {
            const { id, start_time, end_time, shift, day = 'Regular' } = req.body;
            
            const finalShift = shift || '1st Shift';
            const finalDay = day || 'Regular';

            const dbStartTime = parseTimeTo24Hour(start_time);
            const dbEndTime = parseTimeTo24Hour(end_time);

            console.log("📥 Updating Period (Converted):", { id, start_time: dbStartTime, end_time: dbEndTime, shift: finalShift, day: finalDay });

            await db.promise().query(
                "UPDATE periods SET start_time = ?, end_time = ?, shift = ?, day = ? WHERE id = ?", 
                [dbStartTime, dbEndTime, finalShift, finalDay, id]
            );
            res.json({ message: "Period updated successfully" });
        } catch (error) {
            console.error("❌ UPDATE PERIOD ERROR:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async deletePeriod(req, res) {
        try {
            const { id } = req.params;
            await db.promise().query("DELETE FROM periods WHERE id = ?", [id]);
            res.json({ message: "Period deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new TimetableController();