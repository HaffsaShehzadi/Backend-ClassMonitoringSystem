const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const reportController = require("../controllers/reportController");

// 1. Admin: Department-wise attendance (with date range)
router.get(
    "/department/:department_id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.getDepartmentAttendance
);

// 2. Admin or Teacher: Teacher attendance history 
// (Security: Controller will ensure Teacher can only see their own ID's data)
router.get(
    "/teacher/:teacher_id",
    verifyToken,
    roleMiddleware.authorize("admin", "teacher"),
    reportController.getTeacherAttendance
);

// 3. Teacher: Get MY OWN attendance history (Cleaner endpoint for frontend)
router.get(
    "/teacher/my-history",
    verifyToken,
    roleMiddleware.authorize("teacher"),
    reportController.getMyTeacherAttendance
);

// 4. MO: Get history of classes marked by this specific MO
router.get(
    "/mo-history",
    verifyToken,
    roleMiddleware.authorize("admin", "monitoring"), // Note: Agar aapke DB mein role 'MO' hai, toh yahan 'MO' likh dein
    reportController.getMOHistory
);
// Admin: Department-wise PDF
router.get(
    "/department/:department_id/pdf",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.downloadDepartmentAttendancePDF
);

// Admin: Teacher-wise PDF
router.get(
    "/teacher/:teacher_id/pdf",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.downloadTeacherAttendancePDF
);

// Teacher: Own PDF (unchanged)
router.get(
    "/teacher/my-history/pdf",
    verifyToken,
    roleMiddleware.authorize("teacher"),
    reportController.downloadMyTeacherAttendancePDF
);
module.exports = router;