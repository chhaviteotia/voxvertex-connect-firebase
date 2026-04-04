const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userRepository } = require("../repositories");
const { env } = require("../config/env");
const { USER_TYPES } = require("../config/constants");
const { sendPasswordResetEmail } = require("../services/mail");

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

function validateSignup(body) {
  const { email, password, type } = body || {};
  const errors = [];
  if (!email || typeof email !== "string") errors.push("Email is required.");
  else {
    const e = email.trim();
    if (!e) errors.push("Email is required.");
    else if (e.length > MAX_EMAIL_LENGTH) errors.push("Email is too long.");
    else if (!EMAIL_REGEX.test(e)) errors.push("Please enter a valid email address.");
  }
  if (!password || typeof password !== "string") errors.push("Password is required.");
  else {
    if (password.length < MIN_PASSWORD_LENGTH) errors.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    else if (password.length > MAX_PASSWORD_LENGTH) errors.push("Password is too long.");
    else if (!SPECIAL_CHAR_REGEX.test(password)) errors.push("Password must include at least one special character (e.g. ! @ # $ %).");
  }
  if (!type || typeof type !== "string") errors.push("Account type is required.");
  else if (!Object.values(USER_TYPES).includes(type.trim().toLowerCase())) errors.push(`Type must be one of: ${Object.values(USER_TYPES).join(", ")}.`);
  return { valid: errors.length === 0, errors };
}

function validateSignin(body) {
  const { email, password } = body || {};
  if (!email || typeof email !== "string" || !email.trim()) return { valid: false, error: "Email is required." };
  const e = email.trim();
  if (e.length > MAX_EMAIL_LENGTH) return { valid: false, error: "Email is too long." };
  if (!EMAIL_REGEX.test(e)) return { valid: false, error: "Please enter a valid email address." };
  if (!password || typeof password !== "string") return { valid: false, error: "Password is required." };
  if (password.length > MAX_PASSWORD_LENGTH) return { valid: false, error: "Invalid email or password." };
  return { valid: true, email: e.toLowerCase(), password };
}

function signToken(user) {
  return jwt.sign(
    { userId: user._id?.toString?.() || user.id, type: user.type },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

function toPublicUser(user) {
  if (!user) return null;
  const u = { ...user };
  delete u.password;
  u.id = u._id?.toString?.() ?? u.id;
  return u;
}

function hashPasswordResetToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken, "utf8").digest("hex");
}

async function signup(req, res) {
  try {
    const validation = validateSignup(req.body);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(". "),
        errors: validation.errors,
      });
    }
    const { email, password, type, ...rest } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedType = type.trim().toLowerCase();

    const existing = await userRepository.findByEmailAndType(normalizedEmail, normalizedType);
    if (existing) {
      return res.status(409).json({ success: false, error: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const userData = { email: normalizedEmail, password: hashedPassword, type: normalizedType, ...rest };
    if (normalizedType === USER_TYPES.BUSINESS) {
      const raw = req.body.contactName;
      userData.contactName = (raw != null && String(raw).trim() !== "") ? String(raw).trim() : "";
    }
    if (normalizedType === USER_TYPES.EXPERT) {
      const raw = req.body.name;
      userData.name = (raw != null && String(raw).trim() !== "") ? String(raw).trim() : "";
    }
    const user = await userRepository.createUser(userData);
    const token = signToken(user);
    return res.status(201).json({
      success: true,
      user: toPublicUser(user),
      token,
    });
  } catch (err) {
    console.error("[authController.signup]", err);
    return res.status(500).json({ success: false, error: "Signup failed. Please try again." });
  }
}

async function signin(req, res) {
  try {
    const validation = validateSignin(req.body);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    const { email: normalizedEmail, password } = validation;

    const candidates = await userRepository.findByEmailForAuth(normalizedEmail);
    if (!candidates || candidates.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    let matched = null;
    for (const u of candidates) {
      const ok = await bcrypt.compare(password, u.password);
      if (ok) {
        matched = u;
        break;
      }
    }
    if (!matched) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    const token = signToken(matched);
    return res.json({
      success: true,
      user: toPublicUser(matched),
      token,
    });
  } catch (err) {
    console.error("[authController.signin]", err);
    return res.status(500).json({ success: false, error: "Sign in failed. Please try again." });
  }
}

async function forgotPassword(req, res) {
  try {
    const raw = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const email = raw.toLowerCase();
    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, error: "Please enter a valid email address." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashPasswordResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const modified = await userRepository.setPasswordResetTokenByEmail(email, tokenHash, expiresAt);
    if (modified > 0) {
      const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(rawToken)}`;
      await sendPasswordResetEmail(email, resetUrl);
    }

    return res.json({
      success: true,
      message:
        "If an account exists for that email, you will receive password reset instructions shortly.",
    });
  } catch (err) {
    console.error("[authController.forgotPassword]", err);
    return res.status(500).json({ success: false, error: "Could not process request. Please try again later." });
  }
}

async function resetPassword(req, res) {
  try {
    const token = typeof req.body?.token === "string" ? req.body.token.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!token) {
      return res.status(400).json({ success: false, error: "Reset token is missing or invalid." });
    }
    if (!password) {
      return res.status(400).json({ success: false, error: "Password is required." });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res
        .status(400)
        .json({ success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      return res.status(400).json({ success: false, error: "Password is too long." });
    }
    if (!SPECIAL_CHAR_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        error: "Password must include at least one special character (e.g. ! @ # $ %).",
      });
    }

    const tokenHash = hashPasswordResetToken(token);
    const ids = await userRepository.findUserIdsByPasswordResetToken(tokenHash);
    if (!ids.length) {
      return res.status(400).json({
        success: false,
        error: "This reset link is invalid or has expired. Please request a new one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await userRepository.completePasswordResetForUserIds(ids, hashedPassword);

    return res.json({
      success: true,
      message: "Your password has been reset. You can sign in now.",
    });
  } catch (err) {
    console.error("[authController.resetPassword]", err);
    return res.status(500).json({ success: false, error: "Could not reset password. Please try again." });
  }
}

module.exports = { signup, signin, forgotPassword, resetPassword };
