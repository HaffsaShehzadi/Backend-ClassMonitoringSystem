const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const complaintController = require("../controllers/complaintController");

// ============================================
// Complaint Routes
// ============================================

// POST /api/complaints/create
// Sirf TEACHER complaint submit kar sakta hai
router.post(
    "/create",
    verifyToken,
    roleMiddleware.authorize("teacher"),
    complaintController.create
);

// GET /api/complaints/mine
// Teacher apni complaints dekhta hai
router.get(
    "/mine",
    verifyToken,
    roleMiddleware.authorize("teacher"),
    complaintController.getMine
);

// GET /api/complaints/all
// Admin sari complaints dekhta hai (sirf ADMIN)
router.get(
    "/all",
    verifyToken,
    roleMiddleware.authorize("admin"),
    complaintController.getAll
);

// PUT /api/complaints/status/:id
// Resolve/reject - sirf ADMIN ⭐
router.put(
    "/status/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    complaintController.updateStatus
);

module.exports = router;