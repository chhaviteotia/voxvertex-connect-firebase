const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");

function toObjectId(id) {
  if (id == null) return id;
  if (typeof id === "string" && mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
    return new mongoose.Types.ObjectId(id);
  }
  return id;
}

async function create(data) {
  const payload = {
    businessUserId: toObjectId(data.businessUserId),
    expertUserId: toObjectId(data.expertUserId),
    requirementId: data.requirementId != null ? toObjectId(data.requirementId) : null,
    proposalId: data.proposalId != null ? toObjectId(data.proposalId) : null,
  };
  const doc = new Conversation(payload);
  const saved = await doc.save();
  return saved.toObject();
}

async function findById(id) {
  const doc = await Conversation.findById(toObjectId(id))
    .populate("businessUserId", "companyName contactName email")
    .populate("expertUserId", "name email firstName lastName")
    .populate("requirementId")
    .lean();
  return doc || null;
}

async function findByBusinessAndExpertAndRequirement(businessUserId, expertUserId, requirementId) {
  const bid = toObjectId(businessUserId);
  const eid = toObjectId(expertUserId);
  const rid = requirementId != null ? toObjectId(requirementId) : null;
  const query = { businessUserId: bid, expertUserId: eid };
  if (rid != null) query.requirementId = rid;
  const doc = await Conversation.findOne(query)
    .populate("expertUserId", "name email firstName lastName")
    .populate("businessUserId", "companyName contactName email")
    .populate("requirementId")
    .lean();
  return doc || null;
}

async function listByBusinessUser(businessUserId, options = {}) {
  const { limit = 50, skip = 0 } = options;
  const list = await Conversation.find({ businessUserId: toObjectId(businessUserId) })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("expertUserId", "name email firstName lastName")
    .populate("requirementId")
    .lean();
  return list;
}

async function listByExpertUser(expertUserId, options = {}) {
  const { limit = 50, skip = 0 } = options;
  const list = await Conversation.find({ expertUserId: toObjectId(expertUserId) })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("businessUserId", "companyName contactName email")
    .populate("requirementId")
    .lean();
  return list;
}

async function updateUpdatedAt(id) {
  await Conversation.updateOne({ _id: toObjectId(id) }, { $set: { updatedAt: new Date() } });
}

module.exports = {
  create,
  findById,
  findByBusinessAndExpertAndRequirement,
  listByBusinessUser,
  listByExpertUser,
  updateUpdatedAt,
};
