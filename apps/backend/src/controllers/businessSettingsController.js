const bcrypt = require("bcrypt");
const { userRepository } = require("../repositories");
const { USER_TYPES } = require("../config/constants");
const { uploadImageWithFallback } = require("../services/fileStorage");

function ensureBusiness(req, res) {
  if (!req.user || req.user.type !== USER_TYPES.BUSINESS) {
    res.status(403).json({ success: false, error: "Only business accounts can access these settings." });
    return false;
  }
  return true;
}

function splitFullName(fullName) {
  if (!fullName || typeof fullName !== "string") return { firstName: "", lastName: "" };
  const trimmed = String(fullName).trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function mapSettingsFromUser(user) {
  const savedFirst = (user.firstName && String(user.firstName).trim()) || "";
  const savedLast = (user.lastName && String(user.lastName).trim()) || "";
  const hasSavedProfileName = savedFirst !== "" || savedLast !== "";

  const fullNameFromSignup = (user.contactName || user.name || "").trim();
  const fromSignup = splitFullName(fullNameFromSignup);

  const profileFirst = hasSavedProfileName ? savedFirst : fromSignup.firstName;
  const profileLast = hasSavedProfileName ? savedLast : fromSignup.lastName;

  return {
    organization: {
      companyName: user.companyName || "",
      industry: user.industry || "",
      companySize: user.companySize || "",
      website: user.website || "",
      address: user.address || "",
    },
    profile: {
      firstName: profileFirst,
      lastName: profileLast,
      fullName: fullNameFromSignup,
      avatarUrl: user.avatarUrl || "",
      email: user.email || "",
      phone: user.phone || "",
      jobTitle: user.jobTitle || "",
    },
    notifications: {
      expertMatches: user.notifExpertMatches ?? true,
      proposals: user.notifProposals ?? true,
      messages: user.notifMessages ?? true,
      weeklyDigest: user.notifWeeklyDigest ?? false,
    },
  };
}

async function getSettings(req, res) {
  try {
    if (!ensureBusiness(req, res)) return;
    const user = await userRepository.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    return res.json({ success: true, data: mapSettingsFromUser(user) });
  } catch (err) {
    console.error("[businessSettings.getSettings]", err);
    return res.status(500).json({ success: false, error: "Failed to load settings." });
  }
}

async function updateOrganization(req, res) {
  try {
    if (!ensureBusiness(req, res)) return;
    const { companyName, industry, companySize, website, address } = req.body || {};
    const update = {};
    if (typeof companyName === "string") update.companyName = companyName.trim();
    if (typeof industry === "string") update.industry = industry.trim();
    if (typeof companySize === "string") update.companySize = companySize.trim();
    if (typeof website === "string") update.website = website.trim();
    if (typeof address === "string") update.address = address.trim();

    const user = await userRepository.updateById(req.user.userId, update);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    return res.json({ success: true, data: mapSettingsFromUser(user).organization });
  } catch (err) {
    console.error("[businessSettings.updateOrganization]", err);
    return res.status(500).json({ success: false, error: "Failed to update organization settings." });
  }
}

async function updateProfile(req, res) {
  try {
    if (!ensureBusiness(req, res)) return;
    const { firstName, lastName, email, phone, jobTitle } = req.body || {};
    const update = {};
    if (typeof firstName === "string") update.firstName = firstName.trim();
    if (typeof lastName === "string") update.lastName = lastName.trim();
    if (typeof email === "string") update.email = email.trim().toLowerCase();
    if (typeof phone === "string") update.phone = phone.trim();
    if (typeof jobTitle === "string") update.jobTitle = jobTitle.trim();

    const user = await userRepository.updateById(req.user.userId, update);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    return res.json({ success: true, data: mapSettingsFromUser(user).profile });
  } catch (err) {
    console.error("[businessSettings.updateProfile]", err);
    return res.status(500).json({ success: false, error: "Failed to update profile." });
  }
}

async function updateNotifications(req, res) {
  try {
    if (!ensureBusiness(req, res)) return;
    const {
      expertMatches,
      proposals,
      messages,
      weeklyDigest,
    } = req.body || {};

    const update = {};
    if (typeof expertMatches === "boolean") update.notifExpertMatches = expertMatches;
    if (typeof proposals === "boolean") update.notifProposals = proposals;
    if (typeof messages === "boolean") update.notifMessages = messages;
    if (typeof weeklyDigest === "boolean") update.notifWeeklyDigest = weeklyDigest;

    const user = await userRepository.updateById(req.user.userId, update);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    return res.json({ success: true, data: mapSettingsFromUser(user).notifications });
  } catch (err) {
    console.error("[businessSettings.updateNotifications]", err);
    return res.status(500).json({ success: false, error: "Failed to update notifications." });
  }
}

const MIN_PASSWORD_LENGTH = 8;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

async function changePassword(req, res) {
  try {
    if (!ensureBusiness(req, res)) return;
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Current and new password are required." });
    }
    if (typeof newPassword !== "string" || newPassword.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ success: false, error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }
    if (!SPECIAL_CHAR_REGEX.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: "New password must include at least one special character (e.g. ! @ # $ %).",
      });
    }

    const user = await userRepository.findByIdForAuth(req.user.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return res.status(400).json({ success: false, error: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await userRepository.updateById(req.user.userId, { password: hashed });

    return res.json({ success: true });
  } catch (err) {
    console.error("[businessSettings.changePassword]", err);
    return res.status(500).json({ success: false, error: "Failed to change password." });
  }
}

const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

async function uploadAvatar(req, res) {
  try {
    if (!ensureBusiness(req, res)) return;
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, error: "No image file provided." });
    }
    const { buffer, mimetype, size } = req.file;
    if (size > MAX_AVATAR_SIZE_BYTES) {
      return res.status(400).json({ success: false, error: "Image must be 2MB or smaller." });
    }
    if (!ALLOWED_MIMES.includes(mimetype)) {
      return res.status(400).json({ success: false, error: "Only JPG, PNG, GIF, or WebP allowed." });
    }
    const uploaded = await uploadImageWithFallback({
      buffer,
      mimetype,
      destination: `users/${req.user.userId}/avatar-${Date.now()}`,
      cloudinaryFolder: "voxvertex-avatars",
    });
    const user = await userRepository.updateById(req.user.userId, { avatarUrl: uploaded.url });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }
    return res.json({ success: true, avatarUrl: uploaded.url, storageProvider: uploaded.provider });
  } catch (err) {
    console.error("[businessSettings.uploadAvatar]", err);
    return res.status(500).json({ success: false, error: err.message || "Failed to upload photo." });
  }
}

module.exports = {
  getSettings,
  updateOrganization,
  updateProfile,
  updateNotifications,
  changePassword,
  uploadAvatar,
};

