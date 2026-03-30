const { USER_TYPES } = require("../config/constants");
const { requirementRepository } = require("../repositories");

function ensureBusiness(req, res, next) {
  if (req.user?.type !== USER_TYPES.BUSINESS) {
    return res.status(403).json({ success: false, error: "Business account required." });
  }
  next();
}

/**
 * POST /api/business/requirements
 * Body: { status?: 'draft'|'published', formData: object }
 */
async function createRequirement(req, res) {
  try {
    const userId = req.user.userId;
    const { status = "published", formData = {} } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized." });
    }

    const validStatus = status === "draft" || status === "published" ? status : "published";
    const requirement = await requirementRepository.create({
      createdBy: userId,
      status: validStatus,
      formData: formData && typeof formData === "object" ? formData : {},
    });

    return res.status(201).json({
      success: true,
      requirement: {
        id: requirement._id != null ? requirement._id.toString() : requirement._id,
        status: requirement.status,
        formData: requirement.formData,
        createdAt: requirement.createdAt,
      },
    });
  } catch (err) {
    console.error("createRequirement:", err);
    return res.status(500).json({ success: false, error: "Failed to create requirement." });
  }
}

/**
 * GET /api/business/requirements
 * Query: status (optional), limit, skip
 */
async function listRequirements(req, res) {
  try {
    const userId = req.user.userId;
    const status = req.query.status || undefined;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const skip = Math.max(0, parseInt(req.query.skip, 10) || 0);

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized." });
    }

    const requirements = await requirementRepository.listByUser(userId, { status, limit, skip });
    const total = await requirementRepository.countByUser(userId, status);

    return res.json({
      success: true,
      requirements: requirements.map((r) => ({
        id: r._id != null ? r._id.toString() : r._id,
        status: r.status,
        formData: r.formData,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      total,
    });
  } catch (err) {
    console.error("listRequirements:", err);
    return res.status(500).json({ success: false, error: "Failed to list requirements." });
  }
}

/**
 * GET /api/business/requirements/:id
 */
async function getRequirement(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const requirement = await requirementRepository.findById(id);
    if (!requirement) {
      return res.status(404).json({ success: false, error: "Requirement not found." });
    }
    if (String(requirement.createdBy) !== String(userId)) {
      return res.status(403).json({ success: false, error: "Not allowed to view this requirement." });
    }

    return res.json({
      success: true,
      requirement: {
        id: requirement._id != null ? requirement._id.toString() : requirement._id,
        status: requirement.status,
        formData: requirement.formData,
        createdAt: requirement.createdAt,
        updatedAt: requirement.updatedAt,
      },
    });
  } catch (err) {
    console.error("getRequirement:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch requirement." });
  }
}

/**
 * PATCH /api/business/requirements/:id
 * Body: { status?: 'draft'|'published', formData?: object }
 * Updates existing requirement (owner only). Used to save draft or publish an existing draft.
 */
async function updateRequirement(req, res) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { status, formData } = req.body;

    const update = {};
    if (status === "draft" || status === "published") update.status = status;
    if (formData && typeof formData === "object") update.formData = formData;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields to update." });
    }

    const requirement = await requirementRepository.updateById(id, userId, update);
    if (!requirement) {
      return res.status(404).json({ success: false, error: "Requirement not found." });
    }

    return res.json({
      success: true,
      requirement: {
        id: requirement._id != null ? requirement._id.toString() : requirement._id,
        status: requirement.status,
        formData: requirement.formData,
        createdAt: requirement.createdAt,
        updatedAt: requirement.updatedAt,
      },
    });
  } catch (err) {
    console.error("updateRequirement:", err);
    return res.status(500).json({ success: false, error: "Failed to update requirement." });
  }
}

module.exports = {
  ensureBusiness,
  createRequirement,
  listRequirements,
  getRequirement,
  updateRequirement,
};
