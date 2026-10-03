const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const timetableController = require("../controllers/timetableController");

router.get("/all", verifyToken, roleMiddleware.authorize("admin"), timetableController.getAll);

router.get("/by-day", verifyToken, timetableController.getByDayAndShift);

router.post("/create", verifyToken, roleMiddleware.authorize("admin"), timetableController.create);

router.put("/update/:id", verifyToken, roleMiddleware.authorize("admin"), timetableController.update);

router.delete("/delete/:id", verifyToken, roleMiddleware.authorize("admin"), timetableController.remove);

router.get("/config", verifyToken, timetableController.getConfig);
router.post("/config/semester", verifyToken, roleMiddleware.authorize("admin"), timetableController.addSemester);
router.delete("/config/semester", verifyToken, roleMiddleware.authorize("admin"), timetableController.removeSemester);
router.put("/config/semester/rename", verifyToken, roleMiddleware.authorize("admin"), timetableController.renameSemester);
router.post("/config/period", verifyToken, roleMiddleware.authorize("admin"), timetableController.addPeriod);
router.put("/config/period", verifyToken, roleMiddleware.authorize("admin"), timetableController.updatePeriod);
router.delete("/config/period/:id", verifyToken, roleMiddleware.authorize("admin"), timetableController.deletePeriod);

module.exports = router;