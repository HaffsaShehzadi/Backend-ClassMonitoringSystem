const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const attendanceController = require("../controllers/attendanceController");

// Attendance Routes

// POST /api/attendance/mark
// Real-time attendance (time/location check WITH)
router.post(
    "/mark",
    verifyToken,
    roleMiddleware.authorize("monitoring"),
    attendanceController.markAttendance
);

// ✅ NEW: POST /api/attendance/sync-offline
// Offline records sync (time/location check SKIP - MO ne pehle verify kiya tha)
router.post(
    "/sync-offline",
    verifyToken,
    roleMiddleware.authorize("monitoring"),
    attendanceController.syncOfflineAttendance
);

// GET /api/attendance/today
router.get(
    "/today",
    verifyToken,
    attendanceController.getTodayAttendance
);

// GET /api/attendance/my-history
router.get(
    "/my-history",
    verifyToken,
    roleMiddleware.authorize("teacher"),
    attendanceController.getTeacherHistory
);

// PUT /api/attendance/update/:id
router.put(
    "/update/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    attendanceController.updateAttendance
);

module.exports = router;