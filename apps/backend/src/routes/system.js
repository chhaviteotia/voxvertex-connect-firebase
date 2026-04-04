const express = require("express");
const { env } = require("../config/env");
const { isConnected } = require("../config/db");

const router = express.Router();

router.get("/providers", (req, res) => {
  const dbAdapter = String(env.DB_ADAPTER || "mongodb").toLowerCase();
  const storageProvider = String(env.STORAGE_PROVIDER || "cloudinary").toLowerCase();
  const authProvider = String(env.AUTH_PROVIDER || "jwt").toLowerCase();

  const hasCustomMongoUri =
    typeof env.MONGO_URI === "string" &&
    env.MONGO_URI.trim() !== "" &&
    env.MONGO_URI.trim() !== "mongodb://localhost:27017/voxvertex";

  return res.json({
    success: true,
    providers: {
      auth: {
        configured: authProvider,
        firebaseProjectConfigured: Boolean(env.FIREBASE_PROJECT_ID),
      },
      db: {
        configuredAdapter: dbAdapter,
        fallbackToMongoEnabled: Boolean(env.DB_FALLBACK_TO_MONGODB),
        mongoConfigured: hasCustomMongoUri,
        /** Mongo connected or Firebase Admin + Firestore available (see configuredAdapter). */
        mongoConnected: isConnected(),
      },
      storage: {
        configuredProvider: storageProvider,
        firebaseBucketConfigured: Boolean(env.FIREBASE_STORAGE_BUCKET || process.env.GCLOUD_PROJECT),
        cloudinaryConfigured: Boolean(
          env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
        ),
        cloudinaryFallbackEnabled: Boolean(env.STORAGE_ALLOW_CLOUDINARY_FALLBACK),
      },
      firebaseAuth: {
        syncOnSignup: Boolean(env.FIREBASE_AUTH_SYNC),
        identityToolkitConfigured: Boolean(String(env.FIREBASE_WEB_API_KEY || "").trim()),
      },
    },
  });
});

module.exports = router;
