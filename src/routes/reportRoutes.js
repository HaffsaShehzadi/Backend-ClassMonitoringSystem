const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const reportController = require("../controllers/reportController");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(

    "/daily",

    verifyToken,

    roleMiddleware.authorize("admin"),

    reportController.getDailyAttendance

);
router.get(

    "/weekly",

    verifyToken,

    roleMiddleware.authorize("admin"),

    reportController.getWeeklyAttendance

);
router.get(

    "/monthly",

    verifyToken,

    roleMiddleware.authorize("admin"),

    reportController.getMonthlyAttendance

);
router.get(

    "/department/:department_id",

    verifyToken,

    roleMiddleware.authorize("admin"),

    reportController.getDepartmentAttendance

);
router.get(

    "/teacher/:teacher_id",

    verifyToken,

    roleMiddleware.authorize("admin"),

    reportController.getTeacherAttendance

);

module.exports = router;