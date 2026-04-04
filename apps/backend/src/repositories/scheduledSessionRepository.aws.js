async function listByExpert() {
  return [];
}
async function create() {
  throw new Error("AWS adapter not implemented");
}
async function findById() {
  return null;
}
async function updateStatus() {
  return null;
}
async function countUpcomingByExpert() {
  return 0;
}
async function countByStatus() {
  return 0;
}
async function listByRequirementIds() {
  return [];
}

async function countCompletedByExpert() {
  return 0;
}

async function countCompletedByExpertInRange() {
  return 0;
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
