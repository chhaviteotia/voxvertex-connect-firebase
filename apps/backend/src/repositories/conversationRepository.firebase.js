/**
 * Conversation repository – Cloud Firestore.
 */
const { getDb, FieldValue, snapToObject, stripUndefined } = require("./firestoreUtils");

const COL = "conversations";

async function create(data) {
  const db = getDb();
  const ref = db.collection(COL).doc();
  const payload = stripUndefined({
    businessUserId: String(data.businessUserId),
    expertUserId: String(data.expertUserId),
    requirementId: data.requirementId != null ? String(data.requirementId) : null,
    proposalId: data.proposalId != null ? String(data.proposalId) : null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await ref.set(payload);
  return snapToObject(await ref.get());
}

async function findById(id) {
  const db = getDb();
  const snap = await db.collection(COL).doc(String(id)).get();
  if (!snap.exists) return null;
  const conv = snapToObject(snap);
  const [businessSnap, expertSnap, reqSnap] = await Promise.all([
    db.collection("users").doc(String(conv.businessUserId)).get(),
    db.collection("users").doc(String(conv.expertUserId)).get(),
    conv.requirementId ? db.collection("requirements").doc(String(conv.requirementId)).get() : Promise.resolve(null),
  ]);
  return {
    ...conv,
    businessUserId: snapToObject(businessSnap) || conv.businessUserId,
    expertUserId: snapToObject(expertSnap) || conv.expertUserId,
    requirementId: reqSnap && reqSnap.exists ? snapToObject(reqSnap) : conv.requirementId,
  };
}

async function findByBusinessAndExpertAndRequirement(businessUserId, expertUserId, requirementId) {
  const db = getDb();
  const rid = requirementId != null ? String(requirementId) : null;
  let q = db
    .collection(COL)
    .where("businessUserId", "==", String(businessUserId))
    .where("expertUserId", "==", String(expertUserId));
  q = rid == null ? q.where("requirementId", "==", null) : q.where("requirementId", "==", rid);
  const snap = await q.limit(1).get();
  if (snap.empty) return null;
  return findById(snap.docs[0].id);
}

async function listByBusinessUser(businessUserId, options = {}) {
  const db = getDb();
  const { limit = 50, skip = 0 } = options;
  let q = db.collection(COL).where("businessUserId", "==", String(businessUserId)).orderBy("updatedAt", "desc");
  if (skip > 0) q = q.offset(skip);
  q = q.limit(limit);
  const snap = await q.get();
  return Promise.all(snap.docs.map((d) => findById(d.id)));
}

async function listByExpertUser(expertUserId, options = {}) {
  const db = getDb();
  const { limit = 50, skip = 0 } = options;
  let q = db.collection(COL).where("expertUserId", "==", String(expertUserId)).orderBy("updatedAt", "desc");
  if (skip > 0) q = q.offset(skip);
  q = q.limit(limit);
  const snap = await q.get();
  return Promise.all(snap.docs.map((d) => findById(d.id)));
}

async function updateUpdatedAt(id) {
  const db = getDb();
  await db.collection(COL).doc(String(id)).update({ updatedAt: FieldValue.serverTimestamp() });
}

async function countByExpertUser(expertUserId, extraFilter = {}) {
  const db = getDb();
  let q = db.collection(COL).where("expertUserId", "==", String(expertUserId));
  if (extraFilter.createdAt) {
    const r = extraFilter.createdAt;
    if (r.$gte != null && r.$lt != null) {
      q = q.where("createdAt", ">=", r.$gte).where("createdAt", "<", r.$lt);
    } else if (r.$gte != null) {
      q = q.where("createdAt", ">=", r.$gte);
    }
  }
  const agg = await q.count().get();
  return agg.data().count;
}

module.exports = {
  create,
  findById,
  findByBusinessAndExpertAndRequirement,
  listByBusinessUser,
  listByExpertUser,
  updateUpdatedAt,
  countByExpertUser,
};
