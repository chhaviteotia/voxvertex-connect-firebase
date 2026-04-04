/**
 * Proposal repository – MongoDB implementation.
 */
const mongoose = require("mongoose");
const Proposal = require("../models/Proposal");

function toObjectId(id) {
  if (id == null) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
}

async function create(data) {
  const payload = { ...data };
  if (payload.requirementId != null) payload.requirementId = toObjectId(payload.requirementId);
  if (payload.submittedBy != null) payload.submittedBy = toObjectId(payload.submittedBy);
  const doc = new Proposal(payload);
  const saved = await doc.save();
  return saved.toObject();
}

async function listByRequirementId(requirementId, options = {}) {
  const { limit = 50, skip = 0, status } = options;
  const rid = toObjectId(requirementId);
  const query = { requirementId: rid };
  if (status) query.status = status;
  const list = await Proposal.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("submittedBy", "name email firstName lastName")
    .lean();
  return list;
}

async function listBySubmittedBy(userId, options = {}) {
  const { limit = 50, skip = 0, status } = options;
  const uid = toObjectId(userId);
  const query =
    uid !== userId
      ? {
          $or: [{ submittedBy: uid }, { submittedBy: userId }],
        }
      : { submittedBy: uid };
  if (status) query.status = status;
  const list = await Proposal.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "requirementId",
      select: "formData createdBy",
      populate: {
        path: "createdBy",
        select: "companyName",
      },
    })
    .lean();
  return list;
}

async function findById(id) {
  const doc = await Proposal.findById(id).populate("submittedBy", "name email firstName lastName").lean();
  return doc || null;
}

async function countByRequirementId(requirementId, status) {
  const rid = toObjectId(requirementId);
  const query = { requirementId: rid };
  if (status) query.status = status;
  return Proposal.countDocuments(query);
}

async function countBySubmittedBy(userId, status) {
  const uid = toObjectId(userId);
  const query =
    uid !== userId
      ? {
          $or: [{ submittedBy: uid }, { submittedBy: userId }],
        }
      : { submittedBy: uid };
  if (status) query.status = status;
  return Proposal.countDocuments(query);
}

async function updateById(id, data) {
  const payload = { ...data };
  if (payload.statusUpdatedBy != null) payload.statusUpdatedBy = toObjectId(payload.statusUpdatedBy);
  const updated = await Proposal.findByIdAndUpdate(id, payload, { new: true })
    .populate("submittedBy", "name email firstName lastName")
    .lean();
  return updated || null;
}

const NON_DRAFT = { $ne: "draft" };

/**
 * Aggregates for expert analytics dashboard (non-draft proposals only).
 */
async function getExpertAnalytics(expertId) {
  const uid = toObjectId(expertId);
  const baseMatch =
    uid !== expertId
      ? { $or: [{ submittedBy: uid }, { submittedBy: expertId }], status: NON_DRAFT }
      : { submittedBy: uid, status: NON_DRAFT };

  const now = new Date();
  const d30 = new Date(now);
  d30.setDate(d30.getDate() - 30);
  const d60 = new Date(now);
  d60.setDate(d60.getDate() - 60);
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    statusRows,
    totalSubmitted,
    proposalsLast30,
    proposalsPrev30,
    monthlyRows,
    industryRows,
    proposalRids,
    decidedLast30,
    decidedPrev30,
  ] = await Promise.all([
    Proposal.aggregate([{ $match: baseMatch }, { $group: { _id: "$status", c: { $sum: 1 } } }]),
    Proposal.countDocuments(baseMatch),
    Proposal.countDocuments({ ...baseMatch, createdAt: { $gte: d30 } }),
    Proposal.countDocuments({ ...baseMatch, createdAt: { $gte: d60, $lt: d30 } }),
    Proposal.aggregate([
      { $match: { ...baseMatch, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    Proposal.aggregate([
      { $match: baseMatch },
      {
        $lookup: {
          from: "requirements",
          localField: "requirementId",
          foreignField: "_id",
          as: "req",
        },
      },
      { $unwind: { path: "$req", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          industries: {
            $ifNull: ["$req.formData.industrySelected", []],
          },
        },
      },
      { $unwind: { path: "$industries", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$industries", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Proposal.find(baseMatch).select("requirementId").lean(),
    Proposal.aggregate([
      {
        $match: {
          ...baseMatch,
          status: { $in: ["accepted", "declined"] },
          createdAt: { $gte: d30 },
        },
      },
      { $group: { _id: "$status", c: { $sum: 1 } } },
    ]),
    Proposal.aggregate([
      {
        $match: {
          ...baseMatch,
          status: { $in: ["accepted", "declined"] },
          createdAt: { $gte: d60, $lt: d30 },
        },
      },
      { $group: { _id: "$status", c: { $sum: 1 } } },
    ]),
  ]);

  const byStatus = {};
  for (const row of statusRows) {
    if (row._id) byStatus[row._id] = row.c;
  }

  let avgMatchScore = null;
  if (proposalRids.length > 0) {
    let sum = 0;
    for (const p of proposalRids) {
      const rid = String(p.requirementId || "");
      let h = 0;
      for (let i = 0; i < rid.length; i += 1) h += rid.charCodeAt(i);
      sum += 75 + (h % 21);
    }
    avgMatchScore = Math.round(sum / proposalRids.length);
  }

  const pickDecided = (rows) => {
    let acc = 0;
    let dec = 0;
    for (const row of rows) {
      if (row._id === "accepted") acc = row.c;
      if (row._id === "declined") dec = row.c;
    }
    return { accepted: acc, declined: dec, decided: acc + dec };
  };

  const dl = pickDecided(decidedLast30);
  const dp = pickDecided(decidedPrev30);

  return {
    totalSubmitted,
    proposalsLast30,
    proposalsPrev30,
    byStatus,
    monthlyRows,
    industryRows: industryRows.map((r) => ({ industry: r._id, count: r.count })),
    avgMatchScore,
    acceptanceWindowLast30: dl.decided > 0 ? Math.round((dl.accepted / dl.decided) * 1000) / 10 : null,
    acceptanceWindowPrev30: dp.decided > 0 ? Math.round((dp.accepted / dp.decided) * 1000) / 10 : null,
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
