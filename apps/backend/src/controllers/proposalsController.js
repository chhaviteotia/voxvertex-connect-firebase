const { USER_TYPES } = require("../config/constants");
const { proposalRepository, requirementRepository } = require("../repositories");
const cloudinary = require("cloudinary").v2;
const { env } = require("../config/env");

function ensureExpert(req, res, next) {
  if (req.user?.type !== USER_TYPES.EXPERT) {
    return res.status(403).json({ success: false, error: "Expert account required." });
  }
  next();
}

function ensureBusiness(req, res, next) {
  if (req.user?.type !== USER_TYPES.BUSINESS) {
    return res.status(403).json({ success: false, error: "Business account required." });
  }
  next();
}

/**
 * GET /api/expert/proposals
 * Returns proposals submitted by the authenticated expert.
 */
async function listProposalsForExpert(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Invalid auth context." });
    }
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
    const status = req.query.status || undefined;

    const [list, total] = await Promise.all([
      proposalRepository.listBySubmittedBy(userId, { limit, skip, status }),
      proposalRepository.countBySubmittedBy(userId, status),
    ]);

    return res.json({
      success: true,
      proposals: list.map((p) => {
        const requirement = p.requirementId || {};
        const companyName = requirement?.createdBy?.companyName || "Company";
        return {
          id: p._id != null ? p._id.toString() : p._id,
          requirementId:
            requirement?._id != null ? requirement._id.toString() : p.requirementId?.toString?.() || p.requirementId,
          status: p.status,
          businessNote: p.businessNote || "",
          formData: p.formData || {},
          createdAt: p.createdAt,
          requirement: {
            companyName,
            formData: requirement?.formData || {},
          },
        };
      }),
      total,
    });
  } catch (err) {
    console.error("listProposalsForExpert:", err);
    return res.status(500).json({ success: false, error: "Failed to load proposals." });
  }
}

/**
 * POST /api/expert/proposals
 * Body: { requirementId: string, status?: 'draft'|'submitted', formData: object }
 * Expert submits a proposal for an opportunity (published requirement).
 */
async function createProposal(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { requirementId, status = "submitted" } = req.body;
    let parsedFormData = req.body?.formData || {};
    if (typeof req.body?.formData === "string") {
      try {
        parsedFormData = JSON.parse(req.body.formData || "{}");
      } catch (parseErr) {
        return res.status(400).json({ success: false, error: "Invalid formData payload." });
      }
    }
    const formData =
      parsedFormData && typeof parsedFormData === "object" && !Array.isArray(parsedFormData)
        ? { ...parsedFormData }
        : {};

    if (!userId || !requirementId) {
      return res.status(400).json({ success: false, error: "requirementId is required." });
    }

    const requirement = await requirementRepository.findById(requirementId);
    if (!requirement) {
      return res.status(404).json({ success: false, error: "Opportunity not found." });
    }
    if (requirement.status !== "published") {
      return res.status(400).json({ success: false, error: "Can only submit proposals to published opportunities." });
    }

    const validStatus = status === "draft" || status === "submitted" ? status : "submitted";

    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    if (uploadedFiles.length > 0) {
      if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        return res.status(503).json({ success: false, error: "Deliverables upload is not configured." });
      }
      cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
      });
      const deliverableFiles = {};
      for (const file of uploadedFiles) {
        const fieldName = String(file.fieldname || "");
        if (!fieldName.startsWith("deliverableFiles__")) continue;
        const deliverableId = fieldName.slice("deliverableFiles__".length).trim();
        if (!deliverableId) continue;
        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "voxvertex-proposal-deliverables",
              resource_type: "raw",
              use_filename: true,
              unique_filename: true,
            },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          stream.end(file.buffer);
        });
        if (!deliverableFiles[deliverableId]) deliverableFiles[deliverableId] = [];
        deliverableFiles[deliverableId].push({
          originalName: file.originalname,
          url: uploadResult.secure_url,
          downloadUrl: cloudinary.url(uploadResult.public_id, {
            resource_type: "raw",
            type: "upload",
            flags: "attachment",
            secure: true,
          }),
          mimeType: file.mimetype,
          size: file.size,
          publicId: uploadResult.public_id,
          uploadedAt: new Date(),
        });
      }
      if (Object.keys(deliverableFiles).length > 0) {
        formData.deliverableFiles = deliverableFiles;
      }
    }

    const proposal = await proposalRepository.create({
      requirementId,
      submittedBy: userId,
      status: validStatus,
      formData,
    });

    return res.status(201).json({
      success: true,
      proposal: {
        id: proposal._id != null ? proposal._id.toString() : proposal._id,
        requirementId: proposal.requirementId != null ? proposal.requirementId.toString() : proposal.requirementId,
        status: proposal.status,
        formData: proposal.formData,
        createdAt: proposal.createdAt,
      },
    });
  } catch (err) {
    console.error("createProposal:", err);
    return res.status(500).json({ success: false, error: "Failed to submit proposal." });
  }
}

/**
 * GET /api/business/requirements/:requirementId/proposals
 * Returns proposals for a requirement (caller must own the requirement).
 */
async function listProposalsForRequirement(req, res) {
  try {
    const userId = req.user.userId;
    const { requirementId } = req.params;

    const requirement = await requirementRepository.findById(requirementId);
    if (!requirement) {
      return res.status(404).json({ success: false, error: "Requirement not found." });
    }
    if (String(requirement.createdBy) !== String(userId)) {
      return res.status(403).json({ success: false, error: "Not allowed to view proposals for this requirement." });
    }

    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);
    const status = req.query.status || undefined;

    const [list, total] = await Promise.all([
      proposalRepository.listByRequirementId(requirementId, { limit, skip, status }),
      proposalRepository.countByRequirementId(requirementId, status),
    ]);

    return res.json({
      success: true,
      proposals: list.map((p) => {
        const expert = p.submittedBy || {};
        const name = expert.name || [expert.firstName, expert.lastName].filter(Boolean).join(" ") || expert.email || "Expert";
        const initials = name
          .split(/\s+/)
          .map((s) => s[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "EX";
        return {
          id: p._id != null ? p._id.toString() : p._id,
          requirementId: p.requirementId != null ? p.requirementId.toString() : p.requirementId,
          status: p.status,
          businessNote: p.businessNote || "",
          formData: p.formData,
          createdAt: p.createdAt,
          expert: {
            id: expert._id != null ? expert._id.toString() : expert._id,
            name,
            initials,
            email: expert.email,
          },
        };
      }),
      total,
    });
  } catch (err) {
    console.error("listProposalsForRequirement:", err);
    return res.status(500).json({ success: false, error: "Failed to load proposals." });
  }
}

/**
 * PATCH /api/business/requirements/:requirementId/proposals/:proposalId/status
 * Body: { status: 'accepted'|'modification-requested'|'declined'|'submitted', businessNote?: string }
 */
async function updateProposalStatusForRequirement(req, res) {
  try {
    const userId = req.user.userId;
    const { requirementId, proposalId } = req.params;
    const { status, businessNote = "" } = req.body || {};
    const allowedStatuses = new Set(["submitted", "accepted", "modification-requested", "declined"]);

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({ success: false, error: "Invalid status value." });
    }

    const requirement = await requirementRepository.findById(requirementId);
    if (!requirement) {
      return res.status(404).json({ success: false, error: "Requirement not found." });
    }
    if (String(requirement.createdBy) !== String(userId)) {
      return res.status(403).json({ success: false, error: "Not allowed to update proposals for this requirement." });
    }

    const proposal = await proposalRepository.findById(proposalId);
    if (!proposal) {
      return res.status(404).json({ success: false, error: "Proposal not found." });
    }
    if (String(proposal.requirementId) !== String(requirementId)) {
      return res.status(400).json({ success: false, error: "Proposal does not belong to this requirement." });
    }

    const updated = await proposalRepository.updateById(proposalId, {
      status,
      businessNote: typeof businessNote === "string" ? businessNote.trim() : "",
      statusUpdatedAt: new Date(),
      statusUpdatedBy: userId,
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: "Proposal not found." });
    }

    const expert = updated.submittedBy || {};
    const name = expert.name || [expert.firstName, expert.lastName].filter(Boolean).join(" ") || expert.email || "Expert";
    const initials = name
      .split(/\s+/)
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "EX";

    return res.json({
      success: true,
      proposal: {
        id: updated._id != null ? updated._id.toString() : updated._id,
        requirementId: updated.requirementId != null ? updated.requirementId.toString() : updated.requirementId,
        status: updated.status,
        businessNote: updated.businessNote || "",
        formData: updated.formData,
        createdAt: updated.createdAt,
        expert: {
          id: expert._id != null ? expert._id.toString() : expert._id,
          name,
          initials,
          email: expert.email,
        },
      },
    });
  } catch (err) {
    console.error("updateProposalStatusForRequirement:", err);
    return res.status(500).json({ success: false, error: "Failed to update proposal status." });
  }
}

module.exports = {
  ensureExpert,
  ensureBusiness,
  listProposalsForExpert,
  createProposal,
  listProposalsForRequirement,
  updateProposalStatusForRequirement,
};
