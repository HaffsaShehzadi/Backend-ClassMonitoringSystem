const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const userController = require("../controllers/userController");

router.get("/all", verifyToken, roleMiddleware.authorize("admin"), userController.getAllUsers);

router.get("/pending", verifyToken, roleMiddleware.authorize("admin"), userController.getPendingUsers);

router.put("/:id/approve", verifyToken, roleMiddleware.authorize("admin"), (req, res) => {
    req.body.status = 'approved';
    userController.updateUserStatus(req, res);
});

router.put("/:id/reject", verifyToken, roleMiddleware.authorize("admin"), (req, res) => {
    req.body.status = 'rejected';
    userController.updateUserStatus(req, res);
});

router.delete("/:id", verifyToken, roleMiddleware.authorize("admin"), userController.deleteUser);

module.exports = router;