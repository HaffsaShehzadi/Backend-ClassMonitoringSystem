const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const complaintController = require("../controllers/complaintController");

router.post(
    "/create",
    verifyToken,
    roleMiddleware.authorize("teacher"),
    complaintController.create
);
router.get(
    "/mine",
    verifyToken,
    roleMiddleware.authorize("teacher"),
    complaintController.getMine
);
router.get(
    "/all",
    verifyToken,
    roleMiddleware.authorize("admin"),
    complaintController.getAll
);
router.put(
    "/status/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    complaintController.updateStatus
);

module.exports = router;