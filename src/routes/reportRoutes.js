const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const reportController = require("../controllers/reportController");

router.get("/department/:department_id", verifyToken, roleMiddleware.authorize("admin"), reportController.getDepartmentAttendance);

router.get("/teacher/my-history", verifyToken, roleMiddleware.authorize("teacher"), reportController.getMyTeacherAttendance);

router.get("/teacher/:teacher_id", verifyToken, roleMiddleware.authorize("admin", "teacher"), reportController.getTeacherAttendance);

router.get("/mo-history", verifyToken, roleMiddleware.authorize("admin", "monitoring"), reportController.getMOHistory);

router.get("/department/:department_id/pdf", verifyToken, roleMiddleware.authorize("admin"), reportController.downloadDepartmentAttendancePDF);

router.get("/teacher/my-history/pdf", verifyToken, roleMiddleware.authorize("teacher"), reportController.downloadMyTeacherAttendancePDF);

router.get("/teacher/:teacher_id/pdf", verifyToken, roleMiddleware.authorize("admin"), reportController.downloadTeacherAttendancePDF);

module.exports = router;