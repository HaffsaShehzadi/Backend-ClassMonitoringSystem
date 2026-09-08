const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const userController = require("../controllers/userController");

// GET /api/users/all - Sirf ADMIN
router.get(
    "/all",
    verifyToken,
    roleMiddleware.authorize("admin"),
    userController.getAllUsers
);

// DELETE /api/users/:id - Sirf ADMIN
router.delete(
    "/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    userController.deleteUser
);

module.exports = router;