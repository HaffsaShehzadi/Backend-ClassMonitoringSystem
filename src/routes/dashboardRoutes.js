const express = require("express");

const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/dashboardController");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get(

    "/admin",

    verifyToken,

    roleMiddleware.authorize("admin"),

    dashboardController.getAdminDashboard

);
module.exports = router;