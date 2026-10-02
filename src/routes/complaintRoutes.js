const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const complaintController = require("../controllers/complaintController");

// Teacher: submit complaint
router.post("/create", verifyToken, roleMiddleware.authorize("teacher"), complaintController.create);

// Teacher: view own complaints
router.get("/mine", verifyToken, roleMiddleware.authorize("teacher"), complaintController.getMine);

// Admin: view all complaints
router.get("/all", verifyToken, roleMiddleware.authorize("admin"), complaintController.getAll);

// Admin: update complaint status (resolved/rejected)
router.put("/status/:id", verifyToken, roleMiddleware.authorize("admin"), complaintController.updateStatus);

module.exports = router;