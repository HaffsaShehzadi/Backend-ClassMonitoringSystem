const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const monitoringdutyController = require("../controllers/monitoringdutyController");

// Assign duty to Monitoring Official (Admin)
router.post("/assign", verifyToken, roleMiddleware.authorize("admin"), monitoringdutyController.assign);

// Get assigned duties for logged-in MO
router.get("/my-duty", verifyToken, roleMiddleware.authorize("monitoring"), monitoringdutyController.getMyDuty);

// Get all duty assignments (Admin)
router.get("/all", verifyToken, roleMiddleware.authorize("admin"), monitoringdutyController.getAll);

// Delete duty assignment (Admin)
router.delete("/delete/:id", verifyToken, roleMiddleware.authorize("admin"), monitoringdutyController.remove);

module.exports = router;