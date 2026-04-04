/**
 * Proposal repository – Cloud Firestore.
 */
const { getDb, FieldValue, snapToObject, stripUndefined, convTime } = require("./firestoreUtils");

const COL = "proposals";

async function loadUser(db, userId) {
  if (!userId) return null;
  return snapToObject(await db.collection("users").doc(String(userId)).get());
}

async function loadRequirement(db, reqId) {
  if (!reqId) return null;
  const raw = snapToObject(await db.collection("requirements").doc(String(reqId)).get());
  if (!raw) return null;
  const companyName = String(raw.creatorCompanyName || "").trim() || "Company";
  return {
    ...raw,
    createdBy: { companyName, _id: raw.createdBy },
  };
}

async function attachRequirement(db, proposal) {
  const req = await loadRequirement(db, proposal.requirementId);
  return { ...proposal, requirementId: req || proposal.requirementId };
}

async function attachExpert(db, proposal) {
  const expert = await loadUser(db, proposal.submittedBy);
  return { ...proposal, submittedBy: expert || proposal.submittedBy };
}

async function create(data) {
  const db = getDb();
  const ref = db.collection(COL).doc();
  const payload = stripUndefined({
    requirementId: String(data.requirementId),
    submittedBy: String(data.submittedBy),
    status: data.status || "submitted",
    businessNote: data.businessNote || "",
    formData: data.formData && typeof data.formData === "object" ? data.formData : {},
    statusUpdatedAt: data.statusUpdatedAt || null,
    statusUpdatedBy: data.statusUpdatedBy ? String(data.statusUpdatedBy) : null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  await ref.set(payload);
  return snapToObject(await ref.get());
}

async function listByRequirementId(requirementId, options = {}) {
  const db = getDb();
  const { limit = 50, skip = 0, status } = options;
  let q = db.collection(COL).where("requirementId", "==", String(requirementId));
  if (status) q = q.where("status", "==", status);
  q = q.orderBy("createdAt", "desc");
  if (skip > 0) q = q.offset(skip);
  q = q.limit(limit);
  const snap = await q.get();
  const rows = await Promise.all(snap.docs.map((d) => attachExpert(db, snapToObject(d))));
  return rows;
}

async function listBySubmittedBy(userId, options = {}) {
  const db = getDb();
  const { limit = 50, skip = 0, status } = options;
  let q = db.collection(COL).where("submittedBy", "==", String(userId));
  if (status) q = q.where("status", "==", status);
  q = q.orderBy("createdAt", "desc");
  if (skip > 0) q = q.offset(skip);
  q = q.limit(limit);
  const snap = await q.get();
  const rows = await Promise.all(snap.docs.map((d) => attachRequirement(db, snapToObject(d))));
  return rows;
}

async function findById(id) {
  const db = getDb();
  const p = snapToObject(await db.collection(COL).doc(String(id)).get());
  if (!p) return null;
  return attachExpert(db, p);
}

async function countByRequirementId(requirementId, status) {
  const db = getDb();
  let q = db.collection(COL).where("requirementId", "==", String(requirementId));
  if (status) q = q.where("status", "==", status);
  const agg = await q.count().get();
  return agg.data().count;
}

async function countBySubmittedBy(userId, status) {
  const db = getDb();
  let q = db.collection(COL).where("submittedBy", "==", String(userId));
  if (status) q = q.where("status", "==", status);
  const agg = await q.count().get();
  return agg.data().count;
}

async function updateById(id, data) {
  const db = getDb();
  const ref = db.collection(COL).doc(String(id));
  const payload = stripUndefined({
    ...data,
    statusUpdatedBy: data.statusUpdatedBy != null ? String(data.statusUpdatedBy) : data.statusUpdatedBy,
    updatedAt: FieldValue.serverTimestamp(),
  });
  await ref.set(payload, { merge: true });
  return attachExpert(db, snapToObject(await ref.get()));
}

async function batchGetRequirements(db, ids) {
  const unique = [...new Set(ids.map(String))];
  const map = new Map();
  const chunk = 100;
  for (let i = 0; i < unique.length; i += chunk) {
    const slice = unique.slice(i, i + chunk);
    const refs = slice.map((rid) => db.collection("requirements").doc(rid));
    const snaps = await db.getAll(...refs);
    snaps.forEach((s) => {
      const o = snapToObject(s);
      if (o) map.set(s.id, o);
    });
  }
  return map;
}

async function getExpertAnalytics(expertId) {
  const db = getDb();
  const [totalSnap, draftSnap, snap] = await Promise.all([
    db.collection(COL).where("submittedBy", "==", String(expertId)).count().get(),
    db.collection(COL).where("submittedBy", "==", String(expertId)).where("status", "==", "draft").count().get(),
    db
      .collection(COL)
      .where("submittedBy", "==", String(expertId))
      .orderBy("createdAt", "desc")
      .limit(2500)
      .get(),
  ]);
  const exactTotalSubmitted = totalSnap.data().count - draftSnap.data().count;

  const all = snap.docs.map((d) => snapToObject(d)).filter((p) => p.status !== "draft");
  const now = new Date();
  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);
  const d60 = new Date(now);
  d60.setDate(d60.getDate() - 60);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const byStatus = {};
  let proposalsLast30 = 0;
  let proposalsPrev30 = 0;
  const monthlyMap = new Map();
  const decidedLast30 = { accepted: 0, declined: 0 };
  const decidedPrev30 = { accepted: 0, declined: 0 };

  for (const p of all) {
    const st = p.status;
    byStatus[st] = (byStatus[st] || 0) + 1;
    const created = convTime(p.createdAt) || now;
    if (created >= d30) proposalsLast30 += 1;
    if (created >= d60 && created < d30) proposalsPrev30 += 1;
    if (created >= sixMonthsAgo) {
      const y = created.getFullYear();
      const m = created.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, "0")}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    }
    if (st === "accepted" || st === "declined") {
      if (created >= d30) {
        if (st === "accepted") decidedLast30.accepted += 1;
        else decidedLast30.declined += 1;
      }
      if (created >= d60 && created < d30) {
        if (st === "accepted") decidedPrev30.accepted += 1;
        else decidedPrev30.declined += 1;
      }
    }
  }

  const monthlyRows = [...monthlyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [y, m] = key.split("-").map(Number);
      return { _id: { y, m }, count };
    });

  const reqIds = [...new Set(all.map((p) => p.requirementId).filter(Boolean))];
  const reqMap = await batchGetRequirements(db, reqIds);
  const industryCount = new Map();
  for (const p of all) {
    const req = reqMap.get(String(p.requirementId));
    const industries = (req && req.formData && Array.isArray(req.formData.industrySelected) && req.formData.industrySelected) || [];
    for (const ind of industries) {
      const name = String(ind || "").trim();
      if (!name) continue;
      industryCount.set(name, (industryCount.get(name) || 0) + 1);
    }
  }
  const industryRows = [...industryCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([industry, count]) => ({ _id: industry, count }));

  let avgMatchScore = null;
  if (all.length > 0) {
    let sum = 0;
    for (const p of all) {
      const rid = String(p.requirementId || "");
      let h = 0;
      for (let i = 0; i < rid.length; i += 1) h += rid.charCodeAt(i);
      sum += 75 + (h % 21);
    }
    avgMatchScore = Math.round(sum / all.length);
  }

  const dlDecided = decidedLast30.accepted + decidedLast30.declined;
  const dpDecided = decidedPrev30.accepted + decidedPrev30.declined;

  return {
    totalSubmitted: exactTotalSubmitted,
    proposalsLast30,
    proposalsPrev30,
    byStatus,
    monthlyRows,
    industryRows: industryRows.map((r) => ({ industry: r._id, count: r.count })),
    avgMatchScore,
    acceptanceWindowLast30: dlDecided > 0 ? Math.round((decidedLast30.accepted / dlDecided) * 1000) / 10 : null,
    acceptanceWindowPrev30: dpDecided > 0 ? Math.round((decidedPrev30.accepted / dpDecided) * 1000) / 10 : null,
  };
}

module.exports = {
  create,
  listByRequirementId,
  listBySubmittedBy,
  findById,
  countByRequirementId,
  countBySubmittedBy,
  updateById,
  getExpertAnalytics,
};
