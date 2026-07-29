const express = require("express");

const router = express.Router();

const verifyToken =
require("../middleware/authMiddleware");

const roleMiddleware =
require("../middleware/roleMiddleware");

const teacherController =
require("../controllers/teacherController");

router.get(

    "/departments",

    verifyToken,

    roleMiddleware.authorize(
        "teacher"
    ),

    teacherController.getDepartments

);

module.exports = router;