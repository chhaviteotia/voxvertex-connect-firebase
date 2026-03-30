const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { getFirebaseAdmin } = require("../config/firebaseAdmin");

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");

  if (!token) {
    return res.status(401).json({ success: false, error: "Authorization token missing." });
  }

  if (env.AUTH_PROVIDER === "firebase") {
    const admin = getFirebaseAdmin();
    if (!admin) {
      return res.status(500).json({
        success: false,
        error: "Firebase Admin SDK is not available. Install firebase-admin for Firebase auth mode.",
      });
    }
    try {
      const decoded = await admin.auth().verifyIdToken(token, true);
      req.user = {
        userId: decoded.uid,
        type: decoded.type || decoded.role || decoded.userType || "",
        firebase: true,
      };
      return next();
    } catch (firebaseErr) {
      return res.status(401).json({ success: false, error: "Invalid or expired Firebase ID token." });
    }
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { userId: payload.userId, type: payload.type, firebase: false };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, error: "Invalid or expired token." });
  }
}

module.exports = { authMiddleware };

