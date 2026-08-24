const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const timetableController = require("../controllers/timetableController");

// ============================================
// Timetable Routes
// ============================================

// GET /api/timetable/all
// Poori list - sirf ADMIN dekh sakta hai
router.get(
    "/all",
    verifyToken,
    roleMiddleware.authorize("admin"),
    timetableController.getAll
);

// GET /api/timetable/by-day?day=Monday&shift=1st Shift
// Sab logged-in users (MO marking + teacher timetable)
router.get(
    "/by-day",
    verifyToken,
    timetableController.getByDayAndShift
);

// POST /api/timetable/create
// Nayi class - sirf ADMIN bana sakta hai ⭐
router.post(
    "/create",
    verifyToken,
    roleMiddleware.authorize("admin"),
    timetableController.create
);

// PUT /api/timetable/update/:id
// Update - sirf ADMIN ⭐
router.put(
    "/update/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    timetableController.update
);

// DELETE /api/timetable/delete/:id
// Delete - sirf ADMIN ⭐
router.delete(
    "/delete/:id",
    verifyToken,
    roleMiddleware.authorize("admin"),
    timetableController.remove
);

module.exports = router;