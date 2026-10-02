const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

// Get all departments
router.get("/all", departmentController.getAll);

module.exports = router;