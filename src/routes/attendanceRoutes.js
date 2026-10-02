const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const verifyToken = require("../middleware/authMiddleware");

// Mark attendance
router.post("/mark", verifyToken, attendanceController.markAttendance);

// Sync offline attendance records
router.post("/sync-offline", verifyToken, attendanceController.syncOfflineAttendance);

// Get today's attendance
router.get("/today", verifyToken, attendanceController.getTodayAttendance);

// Get teacher attendance history
router.get("/my-history", verifyToken, attendanceController.getTeacherHistory);

// Get monitoring official history
router.get("/mo-history", verifyToken, attendanceController.getMOHistory);

// Update attendance record
router.put("/update/:id", verifyToken, attendanceController.updateAttendance);

module.exports = router;