/**
 * Requirement repository – MongoDB implementation.
 * To switch to AWS: set DB_ADAPTER=aws and implement requirementRepository.aws.js
 */
const Requirement = require("../models/Requirement");

async function create(data) {
  const doc = new Requirement(data);
  const saved = await doc.save();
  return saved.toObject();
}

async function listByUser(userId, options = {}) {
  const { status, limit = 50, skip = 0 } = options;
  const query = { createdBy: userId };
  if (status) query.status = status;
  const list = await Requirement.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
  return list;
}

async function findById(id) {
  const doc = await Requirement.findById(id).lean();
  return doc || null;
}

async function updateById(id, userId, update) {
  if (!id || !userId) return null;
  const doc = await Requirement.findOneAndUpdate(
    { _id: id, createdBy: userId },
    { $set: update },
    { new: true }
  )
    .lean();
  return doc || null;
}

async function countByUser(userId, status) {
  const query = { createdBy: userId };
  if (status) query.status = status;
  return Requirement.countDocuments(query);
}

/** List published requirements for expert Opportunities page. */
async function listPublished(options = {}) {
  const { limit = 50, skip = 0 } = options;
  const list = await Requirement.find({ status: "published" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "companyName")
    .lean();
  return list;
}

module.exports = {
  create,
  listByUser,
  findById,
  updateById,
  countByUser,
  listPublished,
};
