const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const departmentController = require("../controllers/departmentController");

// GET all departments (Public - used by SignUpScreen, Admin screens, etc.)
router.get(
    "/all",
    departmentController.getAll
);

module.exports = router;