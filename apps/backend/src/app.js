const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { env } = require("./config/env");
const { isFirebaseCloudRuntime } = require("./config/runtime");
const { connectDB } = require("./config/db");

let dbReadyPromise = null;

function ensureDbReady() {
  if (!dbReadyPromise) {
    dbReadyPromise = connectDB();
  }
  return dbReadyPromise;
}

async function createApp() {
  await ensureDbReady();

  const app = express();
  app.disable("x-powered-by");
  // One reverse-proxy hop: Firebase Hosting / Cloud Run in prod, or Vite dev proxy locally.
  // Vite forwards X-Forwarded-For; express-rate-limit throws (500) if trust proxy stays false.
  if (isFirebaseCloudRuntime() || env.NODE_ENV !== "production") {
    app.set("trust proxy", 1);
  }

  const allowedOrigins = env.CORS_ORIGIN
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin:
        allowedOrigins.length === 0
          ? true
          : (origin, callback) => {
              if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
              }
              return callback(new Error("Not allowed by CORS"));
            },
    })
  );

  app.use(helmet());
  app.use(express.json());

  app.get("/", (req, res) => res.send("VoxVertex Connect API"));
  app.get("/health", (req, res) => res.status(200).json({ success: true, status: "ok" }));
  app.get("/api/health", (req, res) => res.status(200).json({ success: true, status: "ok" }));

  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/conversations", require("./routes/conversations"));
  app.use("/api/business/settings", require("./routes/businessSettings"));
  app.use("/api/business/requirements", require("./routes/requirements"));
  app.use("/api/business/calendar", require("./routes/businessCalendar"));
  app.use("/api/expert/profile", require("./routes/expertProfile"));
  app.use("/api/expert/proposals", require("./routes/expertProposals"));
  app.use("/api/expert/analytics", require("./routes/expertAnalytics"));
  app.use("/api/expert/calendar", require("./routes/expertCalendar"));
  app.use("/api/expert/opportunities", require("./routes/expertOpportunities"));
  app.use("/api/system", require("./routes/system"));

  return app;
}

module.exports = { createApp };
