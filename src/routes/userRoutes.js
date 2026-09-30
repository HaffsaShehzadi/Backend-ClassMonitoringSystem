const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const userController = require("../controllers/userController");

//Get all approved users
router.get(
    "/all",
    verifyToken,
    roleMiddleware.authorize("admin"),
    userController.getAllUsers
);

//Get pending users
router.get(
    "/pending",
    verifyToken,
    roleMiddleware.authorize("admin"),
    userController.getPendingUsers
);

//Approve a specific user
router.put(
    "/:id/approve",
    verifyToken,
    roleMiddleware.authorize("admin"),
    (req, res) => {
        req.body.status = 'approved'; // Controller ke liye status set karna
        userController.updateUserStatus(req, res);
    }
);

//Reject a specific user
router.put(
    "/:id/reject",
    verifyToken,
    roleMiddleware.authorize("admin"),
    (req, res) => {
        req.body.status = 'rejected'; // Controller ke liye status set karna
        userController.updateUserStatus(req, res);
    }
);

// 5. Delete a specific user
router.delete(
    "/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    userController.deleteUser
);

module.exports = router;