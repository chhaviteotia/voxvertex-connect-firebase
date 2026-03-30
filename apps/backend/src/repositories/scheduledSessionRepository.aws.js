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
module.exports = {
  listByExpert,
  create,
  findById,
  updateStatus,
  countUpcomingByExpert,
  countByStatus,
  listByRequirementIds,
};
