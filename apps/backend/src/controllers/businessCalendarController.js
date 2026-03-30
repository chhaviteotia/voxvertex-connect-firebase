const {
  proposalRepository,
  requirementRepository,
  scheduledSessionRepository,
  userRepository,
} = require("../repositories");
const { USER_TYPES } = require("../config/constants");

function ensureBusiness(req, res) {
  if (!req.user || req.user.type !== USER_TYPES.BUSINESS) {
    res.status(403).json({
      success: false,
      error: "Only business accounts can schedule sessions.",
    });
    return false;
  }
  return true;
}

function normalizeSubmittedById(submittedBy) {
  if (!submittedBy) return null;
  if (typeof submittedBy === "string") return submittedBy;
  if (submittedBy._id) return String(submittedBy._id);
  if (submittedBy.id) return String(submittedBy.id);
  return null;
}

const OUTCOME_TITLES = {
  "skill-development": "Skill Development",
  "revenue-generation": "Revenue Generation",
  "hiring-talent": "Hiring & Talent",
  "brand-positioning": "Brand Positioning",
  "leadership-alignment": "Leadership Alignment",
  "innovation-problem-solving": "Innovation & Problem Solving",
  "compliance-risk": "Compliance & Risk",
  "community-networking": "Community & Networking",
  "product-adoption": "Product Adoption",
  "behavior-change": "Behavior Change",
};

function getRequirementTitle(formData) {
  const data = formData || {};
  const outcome = data.selectedOutcome;
  if (typeof outcome === "string" && OUTCOME_TITLES[outcome]) return OUTCOME_TITLES[outcome];
  const objective = typeof data.objective === "string" ? data.objective.trim() : "";
  if (objective) return objective;
  const audience = Array.isArray(data.audienceSelected) ? data.audienceSelected : [];
  if (audience.length > 0) return `${audience.slice(0, 2).join(", ")} engagement`;
  return "Expert requirement";
}

/** POST /api/business/calendar/sessions
 * Schedules sessions for all accepted experts for a requirement.
 */
async function scheduleRequirementSession(req, res) {
  try {
    if (!ensureBusiness(req, res)) return;
    const {
      requirementId,
      sessionType,
      scheduledDate,
      startTime,
      endTime,
      location,
      note,
    } = req.body || {};

    if (!requirementId || !scheduledDate) {
      return res.status(400).json({
        success: false,
        error: "requirementId and scheduledDate are required.",
      });
    }

    const requirement = await requirementRepository.findById(requirementId);
    if (!requirement) {
      return res.status(404).json({ success: false, error: "Requirement not found." });
    }
    if (String(requirement.createdBy) !== String(req.user.userId)) {
      return res.status(403).json({ success: false, error: "Not allowed for this requirement." });
    }

    const acceptedProposals = await proposalRepository.listByRequirementId(requirementId, {
      status: "accepted",
      limit: 1000,
      skip: 0,
    });
    const expertIds = Array.from(
      new Set(
        acceptedProposals
          .map((p) => normalizeSubmittedById(p.submittedBy))
          .filter(Boolean)
      )
    );

    if (expertIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No accepted experts found for this requirement.",
      });
    }

    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid scheduledDate format.",
      });
    }

    const business = await userRepository.findById(req.user.userId);
    const companyName = (business && business.companyName) || "Company";
    const sessionLabel =
      (sessionType && String(sessionType).trim()) ||
      (requirement.formData &&
      typeof requirement.formData === "object" &&
      typeof requirement.formData.selectedOutcome === "string"
        ? String(requirement.formData.selectedOutcome).replace(/[-_]/g, " ")
        : "Scheduled Session");

    const created = [];
    for (const expertId of expertIds) {
      const existing = await scheduledSessionRepository.listByExpert(expertId, {
        upcomingOnly: false,
      });
      const duplicate = existing.some((s) => {
        const sameDay = new Date(s.scheduledDate).toDateString() === date.toDateString();
        const sameWindow =
          String(s.startTime || "") === String(startTime || "") &&
          String(s.endTime || "") === String(endTime || "");
        const sameRequirement = String(s.requirementId || "") === String(requirementId);
        return sameDay && sameWindow && sameRequirement;
      });
      if (duplicate) continue;

      const session = await scheduledSessionRepository.create({
        expertId,
        requirementId,
        companyName,
        sessionType: sessionLabel,
        status: "confirmed",
        scheduledDate: date,
        startTime: (startTime && String(startTime).trim()) || "",
        endTime: (endTime && String(endTime).trim()) || "",
        location: (location && String(location).trim()) || "",
        note: (note && String(note).trim()) || "",
      });
      created.push({
        id: String(session._id),
        expertId: String(session.expertId),
      });
    }

    return res.status(201).json({
      success: true,
      data: { createdCount: created.length, sessions: created },
    });
  } catch (err) {
    console.error("[businessCalendar.scheduleRequirementSession]", err);
    return res.status(500).json({
      success: false,
      error: "Failed to schedule sessions.",
    });
  }
}

/** GET /api/business/calendar/sessions
 * Returns sessions scheduled by this business (for its own requirements).
 */
async function listScheduledSessions(req, res) {
  try {
    if (!ensureBusiness(req, res)) return;
    const requirements = await requirementRepository.listByUser(req.user.userId, {
      limit: 2000,
      skip: 0,
    });
    const requirementIds = requirements.map((r) => String(r._id));
    if (requirementIds.length === 0) {
      return res.json({ success: true, data: [] });
    }
    const sessions = await scheduledSessionRepository.listByRequirementIds(requirementIds);
    const requirementById = new Map(requirements.map((r) => [String(r._id), r]));
    const data = sessions.map((s) => {
      const rid = s.requirementId ? String(s.requirementId) : "";
      const reqDoc = requirementById.get(rid);
      return {
        id: String(s._id),
        requirementId: rid,
        requirementTitle: reqDoc ? getRequirementTitle(reqDoc.formData) : "Expert requirement",
        companyName: s.companyName || "",
        sessionType: s.sessionType || "",
        status: s.status || "confirmed",
        scheduledDate: s.scheduledDate,
        startTime: s.startTime || "",
        endTime: s.endTime || "",
        location: s.location || "",
      };
    });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("[businessCalendar.listScheduledSessions]", err);
    return res.status(500).json({
      success: false,
      error: "Failed to load scheduled sessions.",
    });
  }
}

module.exports = { scheduleRequirementSession, listScheduledSessions };
