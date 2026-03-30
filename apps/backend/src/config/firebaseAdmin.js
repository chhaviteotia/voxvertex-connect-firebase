let adminInstance = null;

function getFirebaseAdmin() {
  if (adminInstance) return adminInstance;
  try {
    // Lazy load so local JWT mode does not require Firebase deps at runtime.
    // eslint-disable-next-line global-require
    const admin = require("firebase-admin");
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    adminInstance = admin;
    return adminInstance;
  } catch (err) {
    return null;
  }
}

function getStorageBucket() {
  const admin = getFirebaseAdmin();
  if (!admin) return null;
  try {
    return admin.storage().bucket();
  } catch (_err) {
    return null;
  }
}

module.exports = { getFirebaseAdmin, getStorageBucket };
