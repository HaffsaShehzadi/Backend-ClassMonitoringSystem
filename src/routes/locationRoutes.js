const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const locationController = require("../controllers/locationController");

// ✅ Sirf Monitoring Official (MO) apni live location update kar sakta hai
router.post(
    "/update",
    verifyToken,
    roleMiddleware.authorize("monitoring"),
    locationController.updateLocation
);
// 2. GET /api/location/latest/:userId
router.get(
    "/latest/:userId",
    verifyToken,
    roleMiddleware.authorize("admin", "monitoring"),
    locationController.getLatestLocation
);
module.exports = router;