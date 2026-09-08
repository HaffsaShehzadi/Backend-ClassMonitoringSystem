const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const departmentController = require("../controllers/departmentController");

// GET all departments (Admin only)
router.get(
    "/all",
    verifyToken,
    roleMiddleware.authorize("admin"),
    departmentController.getAll
);

module.exports = router;