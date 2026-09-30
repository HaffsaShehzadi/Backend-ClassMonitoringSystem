const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");

//Public - used in SignUpScreen, Admin screens
router.get(
    "/all",
    departmentController.getAll
);
module.exports = router;