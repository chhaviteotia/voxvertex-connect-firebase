const express = require("express");
const {
  getAvailability,
  createAvailability,
  deleteAvailability,
  getSessions,
  createSession,
  updateSessionStatus,
  getStats,
} = require("../controllers/expertCalendarController");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");
const { USER_TYPES } = require("../config/constants");

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(USER_TYPES.EXPERT));

router.get("/availability", getAvailability);
router.post("/availability", createAvailability);
router.delete("/availability/:id", deleteAvailability);

router.get("/sessions", getSessions);
router.post("/sessions", createSession);
router.patch("/sessions/:id", updateSessionStatus);

router.get("/stats", getStats);

module.exports = router;
