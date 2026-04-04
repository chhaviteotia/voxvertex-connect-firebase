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

/** On deployed Cloud Functions, default to Firestore unless DB_ADAPTER or MONGO_URI override. */
function defaultDbAdapter() {
  const explicit = process.env.DB_ADAPTER;
  if (explicit != null && String(explicit).trim() !== "") {
    return String(explicit).toLowerCase();
  }
  if (isFirebaseCloudRuntime()) {
    const mongo = String(process.env.MONGO_URI || "").trim();
    const usesLocalMongo = !mongo || mongo.includes("localhost") || mongo.includes("127.0.0.1");
    if (usesLocalMongo) return "firebase";
  }
  return "mongodb";
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
  /** "mongodb" | "firebase" (default on Cloud Functions without Atlas URI) | "aws" */
  DB_ADAPTER: defaultDbAdapter(),
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
  /**
   * Web API key (Identity Toolkit). Set on Cloud Functions for Firebase password sign-in sync.
   * Same value as the Firebase client Web API key in project settings.
   */
  FIREBASE_WEB_API_KEY: process.env.FIREBASE_WEB_API_KEY || "",
  /**
   * Default Firebase Storage when deployed or when FIREBASE_STORAGE_BUCKET is set (Firebase-first).
   * Set STORAGE_PROVIDER=cloudinary to force Cloudinary when both are configured.
   */
  STORAGE_PROVIDER: (() => {
    const ex = process.env.STORAGE_PROVIDER;
    if (ex != null && String(ex).trim() !== "") return String(ex).toLowerCase();
    if (isFirebaseCloudRuntime()) return "firebase";
    const bucket = String(process.env.FIREBASE_STORAGE_BUCKET || "").trim();
    return bucket ? "firebase" : "cloudinary";
  })(),
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || "",
  /** If true and Cloudinary is configured, fall back when Firebase Storage upload fails. Default false. */
  STORAGE_ALLOW_CLOUDINARY_FALLBACK: String(process.env.STORAGE_ALLOW_CLOUDINARY_FALLBACK || "")
    .toLowerCase()
    .trim() === "true",
  /**
   * Create Firebase Auth users on signup (enables password reset email via Firebase, no SMTP).
   * Defaults true on Cloud Functions; set FIREBASE_AUTH_SYNC=false to disable.
   */
  FIREBASE_AUTH_SYNC: (() => {
    const v = String(process.env.FIREBASE_AUTH_SYNC || "").toLowerCase().trim();
    if (v === "false" || v === "0" || v === "no") return false;
    if (v === "true" || v === "1" || v === "yes") return true;
    return isFirebaseCloudRuntime();
  })(),
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
