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

// 2. Teacher: Get MY OWN attendance history (Must be BEFORE /teacher/:teacher_id)
router.get(
    "/teacher/my-history",
    verifyToken,
    roleMiddleware.authorize("teacher"),
    reportController.getMyTeacherAttendance
);

// 3. Admin or Teacher: Teacher attendance history 
// (Security: Controller will ensure Teacher can only see their own ID's data)
router.get(
    "/teacher/:teacher_id",
    verifyToken,
    roleMiddleware.authorize("admin", "teacher"),
    reportController.getTeacherAttendance
);

// 4. MO: Get history of classes marked by this specific MO
router.get(
    "/mo-history",
    verifyToken,
    roleMiddleware.authorize("admin", "monitoring"), // Note: Agar aapke DB mein role 'MO' hai, toh yahan 'MO' likh dein
    reportController.getMOHistory
);

// 5. Admin: Department-wise PDF
router.get(
    "/department/:department_id/pdf",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.downloadDepartmentAttendancePDF
);

// 6. Teacher: Own PDF (Must be BEFORE /teacher/:teacher_id/pdf)
router.get(
    "/teacher/my-history/pdf",
    verifyToken,
    roleMiddleware.authorize("teacher"),
    reportController.downloadMyTeacherAttendancePDF
);

// 7. Admin: Teacher-wise PDF
router.get(
    "/teacher/:teacher_id/pdf",
    verifyToken,
    roleMiddleware.authorize("admin"),
    reportController.downloadTeacherAttendancePDF
);

module.exports = router;