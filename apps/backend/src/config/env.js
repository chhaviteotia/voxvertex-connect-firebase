const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");
const { isFirebaseCloudRuntime } = require("./runtime");

const dotenvPath = path.resolve(__dirname, "..", "..", ".env");
const treatAsProduction =
  process.env.NODE_ENV === "production" || isFirebaseCloudRuntime();

// Prefer platform env vars in production / deployed functions.
// Only load local `.env` during development and only if the file exists.
if (!treatAsProduction && fs.existsSync(dotenvPath)) {
  dotenv.config({ path: dotenvPath, override: false });
}

const env = {
  NODE_ENV:
    process.env.NODE_ENV ||
    (isFirebaseCloudRuntime() ? "production" : "development"),
  PORT: (() => {
    const v = process.env.PORT;
    const n = typeof v === "string" ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 5000;
  })(),
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/voxvertex",
  /** "mongodb" (default) | "aws" – switch in repositories/index.js */
  DB_ADAPTER: process.env.DB_ADAPTER || "mongodb",
  JWT_SECRET: process.env.JWT_SECRET || "change-me-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "",
  AUTH_RATE_LIMIT_WINDOW_MS: (() => {
    const v = process.env.AUTH_RATE_LIMIT_WINDOW_MS;
    const n = typeof v === "string" ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 900000;
  })(),
  AUTH_RATE_LIMIT_MAX: (() => {
    const v = process.env.AUTH_RATE_LIMIT_MAX;
    const n = typeof v === "string" ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 10;
  })(),
  /**
   * "firebase" (default) tries Firebase ID token first, then JWT fallback.
   * "jwt" uses JWT verification only.
   */
  AUTH_PROVIDER: process.env.AUTH_PROVIDER || "firebase",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || "cloudinary",
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "",
  DB_FALLBACK_TO_MONGODB: (() => {
    const raw = String(process.env.DB_FALLBACK_TO_MONGODB || "true").toLowerCase().trim();
    return raw === "1" || raw === "true" || raw === "yes";
  })(),
  /** Public site URL for password reset links (e.g. https://your-project.web.app) */
  FRONTEND_URL: (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, ""),
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: (() => {
    const v = process.env.SMTP_PORT;
    const n = typeof v === "string" ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) && n > 0 ? n : 587;
  })(),
  SMTP_SECURE: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  SMTP_FROM: process.env.SMTP_FROM || "",
};

if (treatAsProduction && (!env.JWT_SECRET || env.JWT_SECRET === "change-me-in-production")) {
  throw new Error("JWT_SECRET must be set to a strong value in production.");
}

module.exports = { env };
