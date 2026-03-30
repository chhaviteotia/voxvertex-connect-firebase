const express = require("express");
const { getOpportunities } = require("../controllers/expertOpportunitiesController");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");
const { USER_TYPES } = require("../config/constants");

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(USER_TYPES.EXPERT));

router.get("/", getOpportunities);

module.exports = router;
