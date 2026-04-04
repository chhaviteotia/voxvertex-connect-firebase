const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { getExpertAnalytics } = require("../controllers/expertAnalyticsController");

const router = express.Router();

router.use(authMiddleware);
router.get("/", getExpertAnalytics);

module.exports = router;
