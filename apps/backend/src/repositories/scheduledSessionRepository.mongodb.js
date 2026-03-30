const ScheduledSession = require("../models/ScheduledSession");

async function listByExpert(expertId, options = {}) {
  const { upcomingOnly = true } = options;
  const query = { expertId };
  if (upcomingOnly) {
    query.scheduledDate = { $gte: new Date() };
  }
  const docs = await ScheduledSession.find(query)
    .sort({ scheduledDate: 1 })
    .lean();
  return docs;
}

async function create(data) {
  const doc = await ScheduledSession.create(data);
  return doc.toObject();
}

async function findById(id) {
  const doc = await ScheduledSession.findById(id).lean();
  return doc;
}

async function updateStatus(id, expertId, status) {
  const doc = await ScheduledSession.findOneAndUpdate(
    { _id: id, expertId },
    { $set: { status } },
    { new: true }
  ).lean();
  return doc;
}

async function countUpcomingByExpert(expertId) {
  return ScheduledSession.countDocuments({
    expertId,
    scheduledDate: { $gte: new Date() },
  });
}

async function countByStatus(expertId, status) {
  return ScheduledSession.countDocuments({ expertId, status });
}

async function listByRequirementIds(requirementIds = []) {
  if (!Array.isArray(requirementIds) || requirementIds.length === 0) return [];
  const docs = await ScheduledSession.find({ requirementId: { $in: requirementIds } })
    .sort({ scheduledDate: 1, createdAt: -1 })
    .lean();
  return docs;
}

module.exports = {
  listByExpert,
  create,
  findById,
  updateStatus,
  countUpcomingByExpert,
  countByStatus,
  listByRequirementIds,
};
