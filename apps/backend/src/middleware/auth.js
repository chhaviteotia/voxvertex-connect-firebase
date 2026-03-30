const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const { getFirebaseAdmin } = require("../config/firebaseAdmin");

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");

  if (!token) {
    return res.status(401).json({ success: false, error: "Authorization token missing." });
  }

  const authProvider = String(env.AUTH_PROVIDER || "firebase").toLowerCase();
  const tryFirebaseFirst = authProvider !== "jwt";

  if (tryFirebaseFirst) {
    const admin = getFirebaseAdmin();
    if (admin) {
      try {
        const decoded = await admin.auth().verifyIdToken(token, true);
        req.user = {
          userId: decoded.uid,
          type: decoded.type || decoded.role || decoded.userType || "",
          firebase: true,
        };
        return next();
      } catch (_firebaseErr) {
        // Firebase token verification failed; continue to JWT fallback.
      }
    }
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { userId: payload.userId, type: payload.type, firebase: false };
    return next();
  } catch (_jwtErr) {
    return res.status(401).json({
      success: false,
      error: tryFirebaseFirst
        ? "Invalid or expired token (Firebase ID token and JWT verification both failed)."
        : "Invalid or expired token.",
    });
  }
}

module.exports = { authMiddleware };

