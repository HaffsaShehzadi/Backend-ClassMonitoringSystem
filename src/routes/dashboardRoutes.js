const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const dashboardController = require("../controllers/dashboardController");

router.get(
    "/admin",
    verifyToken,
    roleMiddleware.authorize("admin"),
    dashboardController.getAdminDashboard
);
module.exports = router;