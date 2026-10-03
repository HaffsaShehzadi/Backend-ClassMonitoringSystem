const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const sessionController = require("../controllers/sessionController");

router.get("/active", verifyToken, sessionController.getActive);

router.get("/", verifyToken, roleMiddleware.authorize("admin"), sessionController.getAll);

router.post("/", verifyToken, roleMiddleware.authorize("admin"), sessionController.create);

router.put("/:id/activate", verifyToken, roleMiddleware.authorize("admin"), sessionController.setActive);

router.delete("/:id", verifyToken, roleMiddleware.authorize("admin"), sessionController.delete);

module.exports = router;
