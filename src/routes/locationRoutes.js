const express = require("express");

const router = express.Router();

const verifyToken =
require("../middleware/authMiddleware");

const locationController =
require("../controllers/locationController");

router.post(
    "/teacher",
    verifyToken,
    locationController.updateTeacherLocation
);

router.post(
    "/monitor",
    verifyToken,
    locationController.updateMonitorLocation
);

module.exports = router;