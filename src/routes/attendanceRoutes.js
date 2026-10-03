const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const verifyToken = require("../middleware/authMiddleware");


router.post("/mark", verifyToken, attendanceController.markAttendance);

router.post("/sync-offline", verifyToken, attendanceController.syncOfflineAttendance);

router.get("/today", verifyToken, attendanceController.getTodayAttendance);

router.get("/my-history", verifyToken, attendanceController.getTeacherHistory);

router.get("/mo-history", verifyToken, attendanceController.getMOHistory);

router.put("/update/:id", verifyToken, attendanceController.updateAttendance);

module.exports = router;