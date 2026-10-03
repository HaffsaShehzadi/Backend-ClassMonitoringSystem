const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const locationController = require("../controllers/locationController");

router.post("/update", verifyToken, roleMiddleware.authorize("monitoring"), locationController.updateLocation);

router.get("/latest/:userId", verifyToken, roleMiddleware.authorize("admin", "monitoring"), locationController.getLatestLocation);

module.exports = router;