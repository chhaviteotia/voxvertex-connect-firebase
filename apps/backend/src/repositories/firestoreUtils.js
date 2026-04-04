const FieldValue = require("firebase-admin/firestore").FieldValue;
const { getFirebaseAdmin } = require("../config/firebaseAdmin");

function getDb() {
  const admin = getFirebaseAdmin();
  if (!admin) {
    throw new Error(
      "Firebase Admin is not initialized. Deploy to Cloud Functions or set GOOGLE_APPLICATION_CREDENTIALS for local Firestore."
    );
  }
  return admin.firestore();
}

function convTime(v) {
  if (v == null) return v;
  if (typeof v.toDate === "function") return v.toDate();
  if (v instanceof Date) return v;
  return v;
}

function snapToObject(doc) {
  if (!doc.exists) return null;
  const d = doc.data();
  const o = { _id: doc.id, ...d };
  for (const k of Object.keys(o)) {
    const val = o[k];
    if (val && typeof val.toDate === "function") o[k] = val.toDate();
  }
  return o;
}

function omitPassword(obj) {
  if (!obj) return obj;
  const out = { ...obj };
  delete out.password;
  return out;
}

function stripUndefined(payload) {
  const out = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

module.exports = {
  getDb,
  FieldValue,
  convTime,
  snapToObject,
  omitPassword,
  stripUndefined,
};
