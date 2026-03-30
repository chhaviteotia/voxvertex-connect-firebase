const { userRepository } = require("../repositories");
const { USER_TYPES } = require("../config/constants");

function ensureExpert(req, res) {
  if (!req.user || req.user.type !== USER_TYPES.EXPERT) {
    res.status(403).json({ success: false, error: "Only expert accounts can access this profile." });
    return false;
  }
  return true;
}

/**
 * GET /api/expert/profile
 * Returns the current expert's profile (expertProfile from user doc).
 */
async function getProfile(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const user = await userRepository.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    const expertProfile = user.expertProfile || {};
    return res.json({ success: true, data: expertProfile });
  } catch (err) {
    console.error("[expertProfile.getProfile]", err);
    return res.status(500).json({ success: false, error: "Failed to load profile." });
  }
}

/**
 * PATCH /api/expert/profile
 * Body: { identity?, capability?, experience?, delivery?, pricing?, availability? }
 * Merges each provided section into user.expertProfile.
 */
async function updateProfile(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const { identity, capability, experience, delivery, pricing, availability } = req.body || {};
    const userId = req.user.userId;
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    const current = user.expertProfile || {};
    const update = { ...current };
    if (identity !== undefined) update.identity = identity;
    // Shallow merge so PATCH can send partial capability without wiping other keys (e.g. omitted JSON fields).
    if (capability !== undefined && capability !== null && typeof capability === "object") {
      update.capability = { ...(current.capability || {}), ...capability };
    }
    if (experience !== undefined) update.experience = experience;
    if (delivery !== undefined) update.delivery = delivery;
    if (pricing !== undefined) update.pricing = pricing;
    if (availability !== undefined) update.availability = availability;
    const updated = await userRepository.updateById(userId, { expertProfile: update });
    if (!updated) {
      return res.status(500).json({ success: false, error: "Failed to update profile." });
    }
    return res.json({ success: true, data: updated.expertProfile || {} });
  } catch (err) {
    console.error("[expertProfile.updateProfile]", err);
    return res.status(500).json({ success: false, error: "Failed to update profile." });
  }
}

module.exports = { getProfile, updateProfile };
