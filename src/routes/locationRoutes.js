const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const locationController = require("../controllers/locationController");

// ============================================
// Location Routes
// ============================================

// POST /api/location/update
// Teacher + Monitoring DONO ye hi route use karte hain
// verifyToken: login zaroori hai (token se user_id milta hai)
router.post(
    "/update",
    verifyToken,
    locationController.updateLocation
);

// GET /api/location/latest/:userId
// Kisi user ka latest GPS dekhna (testing ke liye)
router.get(
    "/latest/:userId",
    verifyToken,
    locationController.getLatestLocation
);

module.exports = router;