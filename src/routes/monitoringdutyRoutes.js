const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const monitoringdutyController = require("../controllers/monitoringdutyController");

// POST /api/monitoring-duty/assign - sirf ADMIN
router.post(
    "/assign",
    verifyToken,
    roleMiddleware.authorize("admin"),
    monitoringdutyController.assign
);

// GET /api/monitoring-duty/my-duty - sirf MONITORING
router.get(
    "/my-duty",
    verifyToken,
    roleMiddleware.authorize("monitoring"),
    monitoringdutyController.getMyDuty
);

// GET /api/monitoring-duty/all - sirf ADMIN
router.get(
    "/all",
    verifyToken,
    roleMiddleware.authorize("admin"),
    monitoringdutyController.getAll
);

// DELETE /api/monitoring-duty/delete/:id - sirf ADMIN
router.delete(
    "/delete/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    monitoringdutyController.remove
);

module.exports = router;