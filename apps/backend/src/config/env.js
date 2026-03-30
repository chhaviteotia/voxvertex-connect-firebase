const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

const dotenvPath = path.resolve(__dirname, "..", "..", ".env");
const isProduction = process.env.NODE_ENV === "production";

// In production environments (Render/Railway/etc.), prefer platform env vars.
// Only load local `.env` during development and only if the file exists.
if (!isProduction && fs.existsSync(dotenvPath)) {
  dotenv.config({ path: dotenvPath, override: false });
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
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
};

if (env.NODE_ENV === "production" && (!env.JWT_SECRET || env.JWT_SECRET === "change-me-in-production")) {
  throw new Error("JWT_SECRET must be set to a strong value in production.");
}

module.exports = { env };
