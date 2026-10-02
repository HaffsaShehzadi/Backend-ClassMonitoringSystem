const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const reportController = require("../controllers/reportController");

// Department attendance report (Admin)
router.get("/department/:department_id", verifyToken, roleMiddleware.authorize("admin"), reportController.getDepartmentAttendance);

// Teacher attendance history (own records)
router.get("/teacher/my-history", verifyToken, roleMiddleware.authorize("teacher"), reportController.getMyTeacherAttendance);

// Teacher attendance report by teacher ID
router.get("/teacher/:teacher_id", verifyToken, roleMiddleware.authorize("admin", "teacher"), reportController.getTeacherAttendance);

// Monitoring Official marked history
router.get("/mo-history", verifyToken, roleMiddleware.authorize("admin", "monitoring"), reportController.getMOHistory);

// Download department attendance PDF (Admin)
router.get("/department/:department_id/pdf", verifyToken, roleMiddleware.authorize("admin"), reportController.downloadDepartmentAttendancePDF);

// Download teacher's own attendance PDF
router.get("/teacher/my-history/pdf", verifyToken, roleMiddleware.authorize("teacher"), reportController.downloadMyTeacherAttendancePDF);

// Download teacher attendance PDF (Admin)
router.get("/teacher/:teacher_id/pdf", verifyToken, roleMiddleware.authorize("admin"), reportController.downloadTeacherAttendancePDF);

module.exports = router;