/**
 * Availability window repository – Cloud Firestore.
 */
const { getDb, FieldValue, snapToObject, convTime } = require("./firestoreUtils");

const COL = "availabilityWindows";

async function listByExpert(expertId) {
  const db = getDb();
  const snap = await db
    .collection(COL)
    .where("expertId", "==", String(expertId))
    .orderBy("startDate", "asc")
    .get();
  return snap.docs.map((d) => snapToObject(d));
}

async function create(data) {
  const db = getDb();
  const ref = db.collection(COL).doc();
  await ref.set({
    expertId: String(data.expertId),
    startDate: data.startDate instanceof Date ? data.startDate : new Date(data.startDate),
    endDate: data.endDate instanceof Date ? data.endDate : new Date(data.endDate),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return snapToObject(await ref.get());
}

async function deleteById(id, expertId) {
  const db = getDb();
  const ref = db.collection(COL).doc(String(id));
  const cur = snapToObject(await ref.get());
  if (!cur || String(cur.expertId) !== String(expertId)) return false;
  await ref.delete();
  return true;
}

async function countActiveByExpert(expertId) {
  const db = getDb();
  const now = new Date();
  const snap = await db.collection(COL).where("expertId", "==", String(expertId)).where("endDate", ">=", now).get();
  return snap.docs.filter((d) => convTime(snapToObject(d).startDate) <= now).length;
}

module.exports = {
  listByExpert,
  create,
  deleteById,
  countActiveByExpert,
};
