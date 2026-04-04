const express = require("express");
const rateLimit = require("express-rate-limit");
const { signup, signin, forgotPassword, resetPassword } = require("../controllers/authController");
const { env } = require("../config/env");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many authentication attempts. Please try again later." },
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many password reset requests. Please try again later." },
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many attempts. Please try again later." },
});

router.post("/signup", authLimiter, signup);
router.post("/signin", authLimiter, signin);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);

module.exports = router;
