const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const sessionController = require("../controllers/sessionController");

// GET /api/sessions/active (Available for any authenticated user)
router.get("/active", verifyToken, sessionController.getActive);

// GET /api/sessions (Admin view all sessions)
router.get("/", verifyToken, roleMiddleware.authorize("admin"), sessionController.getAll);

// POST /api/sessions (Admin create new session)
router.post("/", verifyToken, roleMiddleware.authorize("admin"), sessionController.create);

// PUT /api/sessions/:id/activate (Admin activate session)
router.put("/:id/activate", verifyToken, roleMiddleware.authorize("admin"), sessionController.setActive);

// DELETE /api/sessions/:id (Admin delete empty session)
router.delete("/:id", verifyToken, roleMiddleware.authorize("admin"), sessionController.delete);

module.exports = router;
