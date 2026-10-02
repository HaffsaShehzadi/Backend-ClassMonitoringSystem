const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const userController = require("../controllers/userController");

// Get all approved users (Admin)
router.get("/all", verifyToken, roleMiddleware.authorize("admin"), userController.getAllUsers);

// Get pending user registrations (Admin)
router.get("/pending", verifyToken, roleMiddleware.authorize("admin"), userController.getPendingUsers);

// Approve a user registration (Admin)
router.put("/:id/approve", verifyToken, roleMiddleware.authorize("admin"), (req, res) => {
    req.body.status = 'approved';
    userController.updateUserStatus(req, res);
});

// Reject a user registration (Admin)
router.put("/:id/reject", verifyToken, roleMiddleware.authorize("admin"), (req, res) => {
    req.body.status = 'rejected';
    userController.updateUserStatus(req, res);
});

// Delete a user (Admin)
router.delete("/:id", verifyToken, roleMiddleware.authorize("admin"), userController.deleteUser);

module.exports = router;