const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const attendanceController = require("../controllers/attendanceController");

// Attendance Routes

// POST /api/attendance/mark
// Attendance mark karna - sirf MONITORING official ⭐
// verifyToken → login zaroori hai
// roleMiddleware → sirf "monitoring" role aage ja sakta hai
router.post(
    "/mark",
    verifyToken,
    roleMiddleware.authorize("monitoring"),
    attendanceController.markAttendance
);

// GET /api/attendance/today
// Aaj ki sari attendance dekhna (MO + admin)
router.get(
    "/today",
    verifyToken,
    attendanceController.getTodayAttendance
);

// GET /api/attendance/my-history
// Teacher ki apni attendance history
router.get(
    "/my-history",
    verifyToken,
    roleMiddleware.authorize("teacher"),
    attendanceController.getTeacherHistory
);
// PUT /api/attendance/update/:id
// Attendance update karna (sirf admin) - sirf status change kar sakta hai 
router.put(
    "/update/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    attendanceController.updateAttendance
);

module.exports = router;