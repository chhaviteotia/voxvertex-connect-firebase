/**
 * Firebase Auth (Identity Toolkit) — password sign-in for server-side verification.
 * Uses the same Web API key as the Firebase client SDK (safe for server-side REST calls).
 */
const { env } = require("../config/env");

/**
 * @returns {Promise<{ localId: string } | null>}
 */
async function signInWithPassword(email, password) {
  const key = String(env.FIREBASE_WEB_API_KEY || "").trim();
  if (!key) return null;

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.localId) {
    return null;
  }
  return { localId: String(data.localId) };
}

module.exports = { signInWithPassword };
