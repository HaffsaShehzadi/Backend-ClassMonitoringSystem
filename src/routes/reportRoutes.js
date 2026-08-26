const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const reportController = require("../controllers/reportController");

// Daily attendance report
router.get(
    "/daily",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.getDailyAttendance
);

// Weekly attendance report
router.get(
    "/weekly",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.getWeeklyAttendance
);

// Monthly attendance report
router.get(
    "/monthly",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.getMonthlyAttendance
);

// Department-wise attendance
router.get(
    "/department/:department_id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.getDepartmentAttendance
);

// Teacher attendance history
router.get(
    "/teacher/:teacher_id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.getTeacherAttendance
);

// Overall attendance summary statistics
router.get(
    "/summary",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.getAttendanceSummary
);

module.exports = router;