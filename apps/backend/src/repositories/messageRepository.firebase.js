/**
 * Message repository – Cloud Firestore.
 */
const { getDb, FieldValue, snapToObject } = require("./firestoreUtils");

const COL = "messages";

async function create(data) {
  const db = getDb();
  const ref = db.collection(COL).doc();
  await ref.set({
    conversationId: String(data.conversationId),
    senderId: String(data.senderId),
    senderType: data.senderType,
    content: data.content,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return snapToObject(await ref.get());
}

async function listByConversationId(conversationId, options = {}) {
  const db = getDb();
  const { limit = 100, skip = 0 } = options;
  let q = db
    .collection(COL)
    .where("conversationId", "==", String(conversationId))
    .orderBy("createdAt", "asc");
  if (skip > 0) q = q.offset(skip);
  q = q.limit(limit);
  const snap = await q.get();
  return snap.docs.map((d) => snapToObject(d));
}

module.exports = {
  create,
  listByConversationId,
};
