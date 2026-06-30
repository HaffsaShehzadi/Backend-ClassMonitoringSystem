const express = require("express");
const router = express.Router();

const attendanceController =
require("../controllers/attendanceController");

const verifyToken =
require("../middleware/authMiddleware");

router.post(
    "/create",
    verifyToken,
    attendanceController.createAttendance
);

router.get(
    "/all",
    verifyToken,
    attendanceController.getAllAttendance
);

module.exports = router;