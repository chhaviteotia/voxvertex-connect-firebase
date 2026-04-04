/**
 * Requirement repository – Cloud Firestore.
 */
const { getDb, FieldValue, snapToObject, stripUndefined } = require("./firestoreUtils");

const COL = "requirements";

async function fetchCreatorCompanyName(userId) {
  const db = getDb();
  const snap = await db.collection("users").doc(String(userId)).get();
  const u = snapToObject(snap);
  return u ? String(u.companyName || "").trim() : "";
}

async function create(data) {
  const db = getDb();
  const ref = db.collection(COL).doc();
  const creatorCompanyName = await fetchCreatorCompanyName(data.createdBy);
  const payload = stripUndefined({
    createdBy: String(data.createdBy),
    status: data.status || "published",
    formData: data.formData && typeof data.formData === "object" ? data.formData : {},
    creatorCompanyName,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await ref.set(payload);
  return snapToObject(await ref.get());
}

async function listByUser(userId, options = {}) {
  const db = getDb();
  const { status, limit = 50, skip = 0 } = options;
  let q = db.collection(COL).where("createdBy", "==", String(userId));
  if (status) q = q.where("status", "==", status);
  q = q.orderBy("createdAt", "desc");
  if (skip > 0) q = q.offset(skip);
  q = q.limit(limit);
  const snap = await q.get();
  return snap.docs.map((d) => snapToObject(d));
}

async function findById(id) {
  const db = getDb();
  return snapToObject(await db.collection(COL).doc(String(id)).get());
}

async function updateById(id, userId, update) {
  const db = getDb();
  const ref = db.collection(COL).doc(String(id));
  const cur = snapToObject(await ref.get());
  if (!cur || String(cur.createdBy) !== String(userId)) return null;
  const payload = stripUndefined({
    ...update,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await ref.set(payload, { merge: true });
  return snapToObject(await ref.get());
}

async function countByUser(userId, status) {
  const db = getDb();
  let q = db.collection(COL).where("createdBy", "==", String(userId));
  if (status) q = q.where("status", "==", status);
  const agg = await q.count().get();
  return agg.data().count;
}

async function listPublished(options = {}) {
  const db = getDb();
  const { limit = 50, skip = 0 } = options;
  let q = db.collection(COL).where("status", "==", "published").orderBy("createdAt", "desc");
  if (skip > 0) q = q.offset(skip);
  q = q.limit(limit);
  const snap = await q.get();
  return snap.docs.map((d) => {
    const raw = snapToObject(d);
    const companyName = String(raw.creatorCompanyName || "").trim() || "Company";
    return {
      ...raw,
      createdBy: { companyName, _id: raw.createdBy },
    };
  });
}

module.exports = {
  create,
  listByUser,
  findById,
  updateById,
  countByUser,
  listPublished,
};
