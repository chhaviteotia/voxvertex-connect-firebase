const express = require("express");
const rateLimit = require("express-rate-limit");
const { signup, signin } = require("../controllers/authController");
const { env } = require("../config/env");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many authentication attempts. Please try again later." },
});

router.post("/signup", authLimiter, signup);
router.post("/signin", authLimiter, signin);

module.exports = router;
