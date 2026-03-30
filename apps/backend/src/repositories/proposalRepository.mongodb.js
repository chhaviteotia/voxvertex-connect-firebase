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

module.exports = {
  create,
  listByRequirementId,
  listBySubmittedBy,
  findById,
  countByRequirementId,
  countBySubmittedBy,
  updateById,
};
