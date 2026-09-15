const express = require("express");
const router = express.Router();

// Controller ko import karein
const attendanceController = require("../controllers/attendanceController");

// Middleware (agar aapke paas hai, warna hata sakte hain)
const verifyToken = require("../middleware/authMiddleware"); 

// 1. Mark Attendance
router.post("/mark", verifyToken, attendanceController.markAttendance);

// 2. Sync Offline Attendance
router.post("/sync-offline", verifyToken, attendanceController.syncOfflineAttendance);

// 3. Get Today's Attendance
router.get("/today", verifyToken, attendanceController.getTodayAttendance);

// 4. Get Teacher History
router.get("/my-history", verifyToken, attendanceController.getTeacherHistory);

// 5. Get MO History
router.get("/mo-history", verifyToken, attendanceController.getMOHistory);

// 6. Update Attendance
router.put("/update/:id", verifyToken, attendanceController.updateAttendance);

module.exports = router;