const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const monitoringdutyController = require("../controllers/monitoringdutyController");

router.post("/assign", verifyToken, roleMiddleware.authorize("admin"), monitoringdutyController.assign);

router.get("/my-duty", verifyToken, roleMiddleware.authorize("monitoring"), monitoringdutyController.getMyDuty);

router.get("/all", verifyToken, roleMiddleware.authorize("admin"), monitoringdutyController.getAll);

router.delete("/delete/:id", verifyToken, roleMiddleware.authorize("admin"), monitoringdutyController.remove);

module.exports = router;