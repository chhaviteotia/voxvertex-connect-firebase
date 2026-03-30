const express = require("express");
const {
  getSettings,
  updateOrganization,
  updateProfile,
  updateNotifications,
  changePassword,
  uploadAvatar,
} = require("../controllers/businessSettingsController");
const { authMiddleware } = require("../middleware/auth");
const { requireRole } = require("../middleware/authorize");
const { USER_TYPES } = require("../config/constants");
const uploadAvatarMiddleware = require("../middleware/uploadAvatar");

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole(USER_TYPES.BUSINESS));

router.get("/", getSettings);
router.patch("/organization", updateOrganization);
router.patch("/profile", updateProfile);
router.patch("/notifications", updateNotifications);
router.post("/change-password", changePassword);
router.post("/avatar", uploadAvatarMiddleware, uploadAvatar);

module.exports = router;

