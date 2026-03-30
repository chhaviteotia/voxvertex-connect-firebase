/**
 * Requirement repository – AWS stub.
 * Implement when switching to AWS (e.g. DynamoDB).
 */
async function create(data) {
  throw new Error("Requirement repository: AWS adapter not implemented.");
}

async function listByUser(userId, options = {}) {
  throw new Error("Requirement repository: AWS adapter not implemented.");
}

async function findById(id) {
  throw new Error("Requirement repository: AWS adapter not implemented.");
}

async function updateById(id, userId, update) {
  throw new Error("Requirement repository: AWS adapter not implemented.");
}

async function countByUser(userId, status) {
  throw new Error("Requirement repository: AWS adapter not implemented.");
}

async function listPublished() {
  return [];
}

module.exports = {
  create,
  listByUser,
  findById,
  updateById,
  countByUser,
  listPublished,
};
