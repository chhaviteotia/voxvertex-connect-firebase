const express = require("express");
const { getProfile, updateProfile } = require("../controllers/expertProfileController");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");
const { USER_TYPES } = require("../config/constants");

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(USER_TYPES.EXPERT));

router.get("/", getProfile);
router.patch("/", updateProfile);

module.exports = router;
