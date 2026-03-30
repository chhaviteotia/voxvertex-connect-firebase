/**
 * User repository – AWS stub (e.g. DynamoDB).
 * Implement when switching from MongoDB: same interface as userRepository.mongodb.js
 */
async function createUser(data) {
  throw new Error("userRepository.aws.js not implemented. Set DB_ADAPTER=mongodb or implement AWS.");
}

async function findByEmailAndType(email, type) {
  throw new Error("userRepository.aws.js not implemented.");
}

async function findByEmailForAuth(email) {
  throw new Error("userRepository.aws.js not implemented.");
}

async function findById(id) {
  throw new Error("userRepository.aws.js not implemented.");
}

module.exports = {
  createUser,
  findByEmailAndType,
  findByEmailForAuth,
  findById,
};
