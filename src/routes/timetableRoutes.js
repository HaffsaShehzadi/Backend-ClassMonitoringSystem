const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const timetableController = require("../controllers/timetableController");

// Get all timetable entries (Admin)
router.get("/all", verifyToken, roleMiddleware.authorize("admin"), timetableController.getAll);

// Get timetable by day and shift
router.get("/by-day", verifyToken, timetableController.getByDayAndShift);

// Create timetable entry (Admin)
router.post("/create", verifyToken, roleMiddleware.authorize("admin"), timetableController.create);

// Update timetable entry (Admin)
router.put("/update/:id", verifyToken, roleMiddleware.authorize("admin"), timetableController.update);

// Delete timetable entry (Admin)
router.delete("/delete/:id", verifyToken, roleMiddleware.authorize("admin"), timetableController.remove);

// Timetable configuration: semesters and periods
router.get("/config", verifyToken, timetableController.getConfig);
router.post("/config/semester", verifyToken, roleMiddleware.authorize("admin"), timetableController.addSemester);
router.delete("/config/semester", verifyToken, roleMiddleware.authorize("admin"), timetableController.removeSemester);
router.put("/config/semester/rename", verifyToken, roleMiddleware.authorize("admin"), timetableController.renameSemester);
router.post("/config/period", verifyToken, roleMiddleware.authorize("admin"), timetableController.addPeriod);
router.put("/config/period", verifyToken, roleMiddleware.authorize("admin"), timetableController.updatePeriod);
router.delete("/config/period/:id", verifyToken, roleMiddleware.authorize("admin"), timetableController.deletePeriod);

module.exports = router;