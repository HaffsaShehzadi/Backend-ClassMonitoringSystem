const timetableModel = require("../models/timetableModel");

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
            const { session_id } = req.query;
            const rows = await timetableModel.getAll(session_id ? parseInt(session_id, 10) : null);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async getByDayAndShift(req, res) {
        try {
            const { day, shift, session_id } = req.query;
            if (!day || !shift) return res.status(400).json({ message: "day and shift required" });
            const rows = await timetableModel.getByDayAndShift(day, shift, session_id ? parseInt(session_id, 10) : null);
            res.json(rows);
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async create(req, res) {
        try {
            const { teacher_name, room_no, department_name, subject_code, semester, day, period_number, shift, session_id } = req.body;
            if (!teacher_name || !room_no || !department_name || !subject_code || !semester || !day || !period_number || !shift) {
                return res.status(400).json({ message: "All fields are required" });
            }

            // 0. Determine target session_id
            let targetSessionId = session_id ? parseInt(session_id, 10) : null;
            if (!targetSessionId) {
                targetSessionId = await timetableModel.getActiveSessionId();
            }

            // 1. Teacher ID dhundna
            const teacher = await timetableModel.findTeacherByName(teacher_name);
            if (!teacher) return res.status(400).json({ message: "Teacher not found." });
            const teacher_id = teacher.id;

            // 2. Room ID dhundna (Trim kar ke check karein taake space ka masla na ho)
            const cleanRoomNo = room_no.trim();
            const room = await timetableModel.findRoomByNo(cleanRoomNo);
            if (!room) {
                return res.status(400).json({ 
                    message: `Room '${cleanRoomNo}' not found in database. Please add the room first.`,
                    hint: "Check rooms table in database."
                }); 
            }
            const room_id = room.id;

            // 3. Department ID dhundna
            const dept = await timetableModel.findDepartmentByName(department_name);
            if (!dept) return res.status(400).json({ message: "Department not found." });
            const department_id = dept.id;

            // 4. Period ID dhundna (Shift aur Day ke sath)
            const periodDay = day === 'Friday' ? 'Friday' : 'Regular';
            const period = await timetableModel.findPeriod(period_number, shift, day);
            if (!period) return res.status(400).json({ message: `Period not found for shift: ${shift} and day: ${periodDay}.` });
            const period_id = period.id;

            // ✅ 5. TEACHER CONFLICT CHECK (In target session)
            const teacherConflict = await timetableModel.checkTeacherConflict(teacher_id, day, period_id, targetSessionId);
            if (teacherConflict) {
                return res.status(400).json({ 
                    message: `${teacher_name} is already has class in ${teacherConflict.semester} Sem (${teacherConflict.dept_name}).`,
                    conflict: teacherConflict
                });
            }

            // ✅ 6. ROOM CONFLICT CHECK (In target session)
            const roomConflict = await timetableModel.checkRoomConflict(room_id, day, period_id, targetSessionId);
            if (roomConflict) {
                return res.status(400).json({ 
                    message: `Room Conflict! Room ${room_no} is already booked during this period.`,
                    conflict: roomConflict
                });
            }

            // ✅ 7. Insert Record with session_id
            const id = await timetableModel.create({ 
                session_id: targetSessionId,
                department_id, 
                semester, 
                day, 
                period_id, 
                teacher_id, 
                subject_code, 
                room_id 
            });
            res.status(201).json({ message: "Class added to timetable", id });
        } catch (error) {
            console.error("========================================");
            console.error("❌❌ CREATE CRASH DETAILS ❌❌");
            console.error("Error Message:", error.message);
            console.error("Error Code:", error.code);
            console.error("SQL Message:", error.sqlMessage);
            console.error("========================================");
            
            res.status(500).json({ message: "Server error", details: error.message });
        }
    }

    async update(req, res) {
        try {
            const { teacher_name, room_no, department_name, subject_code, semester, day, period_number, shift } = req.body;
            const timetableId = req.params.id;

            const teacher = teacher_name ? await timetableModel.findTeacherByName(teacher_name) : null;
            const teacher_id = teacher ? teacher.id : null;

            const room = room_no ? await timetableModel.findRoomByNo(room_no) : null;
            const room_id = room ? room.id : null;

            const dept = department_name ? await timetableModel.findDepartmentByName(department_name) : null;
            const department_id = dept ? dept.id : null;

            const period = await timetableModel.findPeriod(period_number, shift, day);
            const period_id = period ? period.id : null;

            const targetSessionId = await timetableModel.getSessionIdForTimetable(timetableId);

            if (teacher_id && day && period_id) {
                const teacherConflict = await timetableModel.checkTeacherUpdateConflict(
                    teacher_id, day, period_id, semester, timetableId, targetSessionId
                );
                if (teacherConflict) {
                    return res.status(400).json({ 
                        message: "Teacher already has a class at this time", 
                        conflict: { 
                            teacher_name: teacherConflict.teacher_name, 
                            time: `${teacherConflict.start_time} - ${teacherConflict.end_time}` 
                        } 
                    });
                }
            }

            if (room_id && day && period_id) {
                const roomConflict = await timetableModel.checkRoomUpdateConflict(
                    room_id, day, period_id, semester, timetableId, targetSessionId
                );
                if (roomConflict) {
                    return res.status(400).json({ 
                        message: "Room is already booked at this time", 
                        conflict: { 
                            room_no: roomConflict.room_no, 
                            time: `${roomConflict.start_time} - ${roomConflict.end_time}` 
                        } 
                    });
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
            const depts = await timetableModel.getAllDepartments();
            const configSems = await timetableModel.getConfigSemesters();
            const periods = await timetableModel.getAllPeriods();

            const departments = depts.length > 0 ? depts : ['IT', 'BSCS', 'Math', 'Physics', 'English', 'Urdu', 'Islamiat', 'Zoology', 'Economics', 'Political Science', 'Chemistry'];
            const allSems = configSems;

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
            const existing = await timetableModel.findSemesterByName(name);
            if (existing) return res.status(400).json({ message: "Semester already exists" });
            
            await timetableModel.addSemester(name);
            res.status(201).json({ message: "Semester added successfully", name });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async removeSemester(req, res) {
        try {
            const { name } = req.body;
            if (!name) return res.status(400).json({ message: "Semester name is required" });
            await timetableModel.removeSemester(name);
            res.json({ message: "Semester removed successfully", name });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async renameSemester(req, res) {
        try {
            const { oldName, newName } = req.body;
            if (!oldName || !newName) return res.status(400).json({ message: "oldName and newName are required" });
            
            const existing = await timetableModel.findSemesterByName(newName);
            if (existing) return res.status(400).json({ message: "New semester name already exists" });
            
            await timetableModel.renameSemester(oldName, newName);
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

            await timetableModel.addPeriod({
                period_number: id,
                start_time: dbStartTime,
                end_time: dbEndTime,
                shift: finalShift,
                day: finalDay
            });
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

            await timetableModel.updatePeriod(id, {
                start_time: dbStartTime,
                end_time: dbEndTime,
                shift: finalShift,
                day: finalDay
            });
            res.json({ message: "Period updated successfully" });
        } catch (error) {
            console.error("❌ UPDATE PERIOD ERROR:", error.message);
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async deletePeriod(req, res) {
        try {
            const { id } = req.params;
            await timetableModel.deletePeriod(id);
            res.json({ message: "Period deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error", error: error.message });
        }
    }
}

module.exports = new TimetableController();