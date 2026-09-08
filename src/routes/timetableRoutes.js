const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const timetableController = require("../controllers/timetableController");

// ============================================
// Timetable Routes
// ============================================

// GET /api/timetable/all
router.get("/all", verifyToken, roleMiddleware.authorize("admin"), timetableController.getAll);

// GET /api/timetable/by-day?day=Monday&shift=1st Shift
router.get("/by-day", verifyToken, timetableController.getByDayAndShift);

// POST /api/timetable/create
router.post("/create", verifyToken, roleMiddleware.authorize("admin"), timetableController.create);

// PUT /api/timetable/update/:id
router.put("/update/:id", verifyToken, roleMiddleware.authorize("admin"), timetableController.update);

// DELETE /api/timetable/delete/:id
router.delete("/delete/:id", verifyToken, roleMiddleware.authorize("admin"), timetableController.remove);

// ============================================
// ✅ Config Routes (Semesters & Periods)
// ============================================

// GET /api/timetable/config
router.get("/config", verifyToken, timetableController.getConfig);

// POST /api/timetable/config/semester
router.post("/config/semester", verifyToken, roleMiddleware.authorize("admin"), timetableController.addSemester);

// DELETE /api/timetable/config/semester
router.delete("/config/semester", verifyToken, roleMiddleware.authorize("admin"), timetableController.removeSemester);

// POST /api/timetable/config/period
router.post("/config/period", verifyToken, roleMiddleware.authorize("admin"), timetableController.addPeriod);

// PUT /api/timetable/config/period
router.put("/config/period", verifyToken, roleMiddleware.authorize("admin"), timetableController.updatePeriod);

// DELETE /api/timetable/config/period/:id
router.delete("/config/period/:id", verifyToken, roleMiddleware.authorize("admin"), timetableController.deletePeriod);

// PUT /api/timetable/config/semester/rename
// PUT /api/timetable/config/semester/rename
router.put(
    "/config/semester/rename",
    verifyToken,
    roleMiddleware.authorize("admin"),
    timetableController.renameSemester
);

module.exports = router;