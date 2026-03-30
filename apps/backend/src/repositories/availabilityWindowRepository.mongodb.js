const AvailabilityWindow = require("../models/AvailabilityWindow");

async function listByExpert(expertId) {
  const docs = await AvailabilityWindow.find({ expertId })
    .sort({ startDate: 1 })
    .lean();
  return docs;
}

async function create(data) {
  const doc = await AvailabilityWindow.create(data);
  return doc.toObject();
}

async function deleteById(id, expertId) {
  const result = await AvailabilityWindow.findOneAndDelete({
    _id: id,
    expertId,
  });
  return result != null;
}

async function countActiveByExpert(expertId) {
  const now = new Date();
  return AvailabilityWindow.countDocuments({
    expertId,
    endDate: { $gte: now },
    startDate: { $lte: now },
  });
}

module.exports = {
  listByExpert,
  create,
  deleteById,
  countActiveByExpert,
};
