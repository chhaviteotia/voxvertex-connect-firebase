/**
 * User repository – Cloud Firestore (Admin SDK). API-only; clients never touch Firestore directly.
 */
const { getDb, FieldValue, snapToObject, omitPassword, stripUndefined, convTime } = require("./firestoreUtils");

const COL = "users";

async function createUser(data) {
  const db = getDb();
  const ref = db.collection(COL).doc();
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email;
  const payload = stripUndefined({
    ...data,
    email,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await ref.set(payload);
  const snap = await ref.get();
  return omitPassword(snapToObject(snap));
}

/** Same as createUser but uses a fixed document id (e.g. Firebase Auth uid) for Firebase-first signup. */
async function createUserWithId(id, data) {
  const db = getDb();
  const ref = db.collection(COL).doc(String(id));
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email;
  const payload = stripUndefined({
    ...data,
    email,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await ref.set(payload);
  const snap = await ref.get();
  return omitPassword(snapToObject(snap));
}

async function findByEmailAndType(email, type) {
  const db = getDb();
  const e = email.trim().toLowerCase();
  const snap = await db.collection(COL).where("email", "==", e).where("type", "==", type).limit(1).get();
  if (snap.empty) return null;
  return omitPassword(snapToObject(snap.docs[0]));
}

async function findByEmailForAuth(email) {
  const db = getDb();
  const e = email.trim().toLowerCase();
  const snap = await db.collection(COL).where("email", "==", e).get();
  return snap.docs.map((d) => snapToObject(d));
}

async function findById(id) {
  const db = getDb();
  const snap = await db.collection(COL).doc(String(id)).get();
  const u = snapToObject(snap);
  return u ? omitPassword(u) : null;
}

async function findByIdForAuth(id) {
  const db = getDb();
  return snapToObject(await db.collection(COL).doc(String(id)).get());
}

async function updateById(id, update) {
  const db = getDb();
  const ref = db.collection(COL).doc(String(id));
  const payload = stripUndefined({
    ...update,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await ref.set(payload, { merge: true });
  const snap = await ref.get();
  const u = snapToObject(snap);
  return u ? omitPassword(u) : null;
}

async function setPasswordResetTokenByEmail(email, tokenHash, expiresAt) {
  const db = getDb();
  const e = email.trim().toLowerCase();
  const snap = await db.collection(COL).where("email", "==", e).get();
  let modified = 0;
  const batch = db.batch();
  snap.docs.forEach((doc) => {
    batch.update(doc.ref, {
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: expiresAt,
      updatedAt: FieldValue.serverTimestamp(),
    });
    modified += 1;
  });
  if (modified) await batch.commit();
  return modified;
}

async function findUserIdsByPasswordResetToken(tokenHash) {
  const db = getDb();
  const snap = await db.collection(COL).where("passwordResetTokenHash", "==", tokenHash).get();
  const now = new Date();
  return snap.docs
    .map((d) => snapToObject(d))
    .filter((u) => u.passwordResetExpires && convTime(u.passwordResetExpires) > now)
    .map((u) => u._id);
}

async function completePasswordResetForUserIds(ids, hashedPassword) {
  if (!ids || ids.length === 0) return;
  const db = getDb();
  const batch = db.batch();
  ids.forEach((id) => {
    const ref = db.collection(COL).doc(String(id));
    batch.update(ref, {
      password: hashedPassword,
      passwordResetTokenHash: FieldValue.delete(),
      passwordResetExpires: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
}

module.exports = {
  createUser,
  createUserWithId,
  findByEmailAndType,
  findByEmailForAuth,
  findById,
  findByIdForAuth,
  updateById,
  setPasswordResetTokenByEmail,
  findUserIdsByPasswordResetToken,
  completePasswordResetForUserIds,
};
