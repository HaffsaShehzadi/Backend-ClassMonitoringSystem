const express = require("express");
const router = express.Router();

const timetableController =
require("../controllers/timetableController");

const verifyToken =
require("../middleware/authMiddleware");

router.post(
    "/create",
    verifyToken,
    timetableController.createTimetable
);

router.get(
    "/all",
    verifyToken,
    timetableController.getAllTimetables
);

router.put(
    "/update/:id",
    verifyToken,
    timetableController.updateTimetable
);

router.delete(
    "/delete/:id",
    verifyToken,
    timetableController.deleteTimetable
);

module.exports = router;