const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

router.get("/all", departmentController.getAll);

module.exports = router;