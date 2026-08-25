const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const dashboardController = require("../controllers/dashboardController");

// ============================================
// Dashboard Routes - sab sirf ADMIN ke liye
// ============================================

// GET /api/dashboard/admin - counts (cards)
router.get(
    "/admin",
    verifyToken,
    roleMiddleware.authorize("admin"),
    dashboardController.getAdminDashboard
);

// GET /api/dashboard/pending-users - pending teachers
router.get(
    "/pending-users",
    verifyToken,
    roleMiddleware.authorize("admin"),
    dashboardController.getPendingUsers
);

// PUT /api/dashboard/approve/:id - approve teacher
router.put(
    "/approve/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    dashboardController.approveUser
);

// PUT /api/dashboard/reject/:id - reject teacher
router.put(
    "/reject/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    dashboardController.rejectUser
);

module.exports = router;