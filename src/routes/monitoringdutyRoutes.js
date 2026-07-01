const express = require("express");

const router = express.Router();

const verifyToken =
require("../middleware/authMiddleware");

const monitoringdutyController =
require("../controllers/monitoringdutyController");

router.post(
    "/assign",
    verifyToken,
    monitoringdutyController.assignDuty
);

router.get(
    "/all",
    verifyToken,
    monitoringdutyController.getAllDuties
);

module.exports = router;