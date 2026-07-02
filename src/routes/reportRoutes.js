const express = require("express");

const router = express.Router();

const verifyToken =
require("../middleware/authMiddleware");

const reportController =
require("../controllers/reportController");

router.get(

    "/daily",

    verifyToken,

    reportController.getDailyAttendance

);

module.exports = router;