/**
 * Scheduled session repository – Cloud Firestore.
 */
const { getDb, FieldValue, snapToObject, convTime } = require("./firestoreUtils");

const COL = "scheduledSessions";

async function listByExpert(expertId, options = {}) {
  const db = getDb();
  const { upcomingOnly = true } = options;
  let q = db.collection(COL).where("expertId", "==", String(expertId));
  if (upcomingOnly) q = q.where("scheduledDate", ">=", new Date());
  q = q.orderBy("scheduledDate", "asc");
  const snap = await q.get();
  return snap.docs.map((d) => snapToObject(d));
}

async function create(data) {
  const db = getDb();
  const ref = db.collection(COL).doc();
  const scheduledDate = data.scheduledDate instanceof Date ? data.scheduledDate : new Date(data.scheduledDate);
  await ref.set({
    expertId: String(data.expertId),
    requirementId: data.requirementId != null ? String(data.requirementId) : null,
    companyName: data.companyName || "",
    sessionType: data.sessionType || "",
    status: data.status || "pending",
    scheduledDate,
    startTime: data.startTime || "",
    endTime: data.endTime || "",
    location: data.location || "",
    note: data.note || "",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return snapToObject(await ref.get());
}

async function findById(id) {
  const db = getDb();
  return snapToObject(await db.collection(COL).doc(String(id)).get());
}

async function updateStatus(id, expertId, status) {
  const db = getDb();
  const ref = db.collection(COL).doc(String(id));
  const cur = snapToObject(await ref.get());
  if (!cur || String(cur.expertId) !== String(expertId)) return null;
  await ref.update({ status, updatedAt: FieldValue.serverTimestamp() });
  return snapToObject(await ref.get());
}

async function countUpcomingByExpert(expertId) {
  const db = getDb();
  const snap = await db
    .collection(COL)
    .where("expertId", "==", String(expertId))
    .where("scheduledDate", ">=", new Date())
    .count()
    .get();
  return snap.data().count;
}

async function countByStatus(expertId, status) {
  const db = getDb();
  const snap = await db
    .collection(COL)
    .where("expertId", "==", String(expertId))
    .where("status", "==", status)
    .count()
    .get();
  return snap.data().count;
}

async function listByRequirementIds(requirementIds = []) {
  if (!Array.isArray(requirementIds) || requirementIds.length === 0) return [];
  const db = getDb();
  const ids = requirementIds.map(String);
  const out = [];
  const chunk = 10;
  for (let i = 0; i < ids.length; i += chunk) {
    const slice = ids.slice(i, i + chunk);
    const snap = await db.collection(COL).where("requirementId", "in", slice).get();
    snap.docs.forEach((d) => out.push(snapToObject(d)));
  }
  out.sort((a, b) => convTime(a.scheduledDate) - convTime(b.scheduledDate));
  return out;
}

async function countCompletedByExpert(expertId) {
  const db = getDb();
  const snap = await db
    .collection(COL)
    .where("expertId", "==", String(expertId))
    .where("status", "==", "confirmed")
    .where("scheduledDate", "<", new Date())
    .count()
    .get();
  return snap.data().count;
}

async function countCompletedByExpertInRange(expertId, start, end) {
  const db = getDb();
  const now = new Date();
  const capEnd = end.getTime() > now.getTime() ? now : end;
  const snap = await db
    .collection(COL)
    .where("expertId", "==", String(expertId))
    .where("status", "==", "confirmed")
    .where("scheduledDate", ">=", start)
    .where("scheduledDate", "<", capEnd)
    .count()
    .get();
  return snap.data().count;
}

module.exports = {
  listByExpert,
  create,
  findById,
  updateStatus,
  countUpcomingByExpert,
  countByStatus,
  listByRequirementIds,
  countCompletedByExpert,
  countCompletedByExpertInRange,
};
