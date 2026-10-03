const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const dashboardController = require("../controllers/dashboardController");

router.get("/admin", verifyToken, roleMiddleware.authorize("admin"), dashboardController.getAdminDashboard);

router.get("/pending-users", verifyToken, roleMiddleware.authorize("admin"), dashboardController.getPendingUsers);

router.put("/approve/:id", verifyToken, roleMiddleware.authorize("admin"), dashboardController.approveUser);

router.put("/reject/:id", verifyToken, roleMiddleware.authorize("admin"), dashboardController.rejectUser);

router.get("/rejected-users", verifyToken, roleMiddleware.authorize("admin"), dashboardController.getRejectedUsers);

router.delete("/rejected/:id", verifyToken, roleMiddleware.authorize("admin"), dashboardController.deleteRejectedUser);

module.exports = router;