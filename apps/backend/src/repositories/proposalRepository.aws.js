/**
 * Proposal repository – AWS stub.
 */
async function create(data) {
  throw new Error("Proposal repository: AWS adapter not implemented.");
}

async function listByRequirementId(requirementId, options = {}) {
  return [];
}

async function listBySubmittedBy(userId, options = {}) {
  return [];
}

async function findById(id) {
  return null;
}

async function countByRequirementId(requirementId, status) {
  return 0;
}

async function countBySubmittedBy(userId, status) {
  return 0;
}

async function updateById(id, data) {
  throw new Error("Proposal repository: AWS adapter not implemented.");
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
