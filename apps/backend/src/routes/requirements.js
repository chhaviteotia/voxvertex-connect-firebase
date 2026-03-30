const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const {
  ensureBusiness,
  createRequirement,
  listRequirements,
  getRequirement,
  updateRequirement,
} = require("../controllers/requirementsController");
const {
  listProposalsForRequirement,
  updateProposalStatusForRequirement,
} = require("../controllers/proposalsController");

const router = express.Router();

router.use(authMiddleware);
router.use(ensureBusiness);

router.post("/", createRequirement);
router.get("/", listRequirements);
router.get("/:requirementId/proposals", listProposalsForRequirement);
router.patch("/:requirementId/proposals/:proposalId/status", updateProposalStatusForRequirement);
router.get("/:id", getRequirement);
router.patch("/:id", updateRequirement);

module.exports = router;
