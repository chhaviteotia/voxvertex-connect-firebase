let adminInstance = null;

function getFirebaseAdmin() {
  if (adminInstance) return adminInstance;
  try {
    // eslint-disable-next-line global-require
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      const projectId =
        process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.FIREBASE_PROJECT_ID || "";
      const opts = {};
      if (projectId) opts.projectId = projectId;
      // Lazy env for storage bucket default (matches Firebase Console default bucket name).
      // eslint-disable-next-line global-require
      const { env } = require("./env");
      const bucket =
        String(env.FIREBASE_STORAGE_BUCKET || "").trim() ||
        (projectId ? `${projectId}.appspot.com` : undefined);
      if (bucket) opts.storageBucket = bucket;
      if (Object.keys(opts).length > 0) admin.initializeApp(opts);
      else admin.initializeApp();
    }
    adminInstance = admin;
    return adminInstance;
  } catch (_err) {
    return null;
  }
}

function getStorageBucket() {
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  try {
    // eslint-disable-next-line global-require
    const { env } = require("./env");
    const explicit = String(env.FIREBASE_STORAGE_BUCKET || "").trim();
    const projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || process.env.FIREBASE_PROJECT_ID;
    const name = explicit || (projectId ? `${projectId}.appspot.com` : "");
    if (name) return admin.storage().bucket(name);
    return admin.storage().bucket();
  } catch (_err) {
    return null;
  }
}

module.exports = { getFirebaseAdmin, getStorageBucket };
