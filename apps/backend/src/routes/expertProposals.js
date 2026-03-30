const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { ensureExpert, createProposal, listProposalsForExpert } = require("../controllers/proposalsController");
const uploadProposalDeliverables = require("../middleware/uploadProposalDeliverables");

const router = express.Router();

router.use(authMiddleware);
router.use(ensureExpert);

router.get("/", listProposalsForExpert);
router.post("/", uploadProposalDeliverables, createProposal);

module.exports = router;
