const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const dashboardController = require("../controllers/dashboardController");

// Admin dashboard summary statistics
router.get("/admin", verifyToken, roleMiddleware.authorize("admin"), dashboardController.getAdminDashboard);

// Pending user registrations
router.get("/pending-users", verifyToken, roleMiddleware.authorize("admin"), dashboardController.getPendingUsers);

// Approve user registration
router.put("/approve/:id", verifyToken, roleMiddleware.authorize("admin"), dashboardController.approveUser);

// Reject user registration
router.put("/reject/:id", verifyToken, roleMiddleware.authorize("admin"), dashboardController.rejectUser);

// View rejected users
router.get("/rejected-users", verifyToken, roleMiddleware.authorize("admin"), dashboardController.getRejectedUsers);

// Delete rejected user permanently
router.delete("/rejected/:id", verifyToken, roleMiddleware.authorize("admin"), dashboardController.deleteRejectedUser);

module.exports = router;