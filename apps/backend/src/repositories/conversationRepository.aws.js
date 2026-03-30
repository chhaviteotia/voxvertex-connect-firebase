async function create() {
  throw new Error("Conversation repository: AWS adapter not implemented.");
}
async function findById() {
  return null;
}
async function findByBusinessAndExpertAndRequirement() {
  return null;
}
async function listByBusinessUser() {
  return [];
}
async function listByExpertUser() {
  return [];
}
async function updateUpdatedAt() {}

module.exports = {
  create,
  findById,
  findByBusinessAndExpertAndRequirement,
  listByBusinessUser,
  listByExpertUser,
  updateUpdatedAt,
};
