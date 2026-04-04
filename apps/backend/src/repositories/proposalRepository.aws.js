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

async function getExpertAnalytics() {
  return {
    totalSubmitted: 0,
    proposalsLast30: 0,
    proposalsPrev30: 0,
    byStatus: {},
    monthlyRows: [],
    industryRows: [],
    avgMatchScore: null,
    acceptanceWindowLast30: null,
    acceptanceWindowPrev30: null,
  };
}

module.exports = {
  create,
  listByRequirementId,
  listBySubmittedBy,
  findById,
  countByRequirementId,
  countBySubmittedBy,
  updateById,
  getExpertAnalytics,
};
