const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");
const { USER_TYPES } = require("../config/constants");
const {
  scheduleRequirementSession,
  listScheduledSessions,
} = require("../controllers/businessCalendarController");

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(USER_TYPES.BUSINESS));
router.get("/sessions", listScheduledSessions);
router.post("/sessions", scheduleRequirementSession);

module.exports = router;
