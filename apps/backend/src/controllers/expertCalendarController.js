const {
  availabilityWindowRepository,
  scheduledSessionRepository,
} = require("../repositories");
const { USER_TYPES } = require("../config/constants");

function ensureExpert(req, res) {
  if (!req.user || req.user.type !== USER_TYPES.EXPERT) {
    res.status(403).json({
      success: false,
      error: "Only expert accounts can access calendar.",
    });
    return false;
  }
  return true;
}

/** GET /api/expert/calendar/availability */
async function getAvailability(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const windows = await availabilityWindowRepository.listByExpert(
      req.user.userId
    );
    const items = windows.map((w) => ({
      id: w._id.toString(),
      startDate: w.startDate,
      endDate: w.endDate,
      note: w.note || "",
    }));
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("[expertCalendar.getAvailability]", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to load availability." });
  }
}

/** POST /api/expert/calendar/availability */
async function createAvailability(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const { startDate, endDate, note } = req.body || {};
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "startDate and endDate are required.",
      });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format.",
      });
    }
    if (end < start) {
      return res.status(400).json({
        success: false,
        error: "endDate must be after startDate.",
      });
    }
    const window = await availabilityWindowRepository.create({
      expertId: req.user.userId,
      startDate: start,
      endDate: end,
      note: (note && String(note).trim()) || "",
    });
    return res.status(201).json({
      success: true,
      data: {
        id: window._id.toString(),
        startDate: window.startDate,
        endDate: window.endDate,
        note: window.note || "",
      },
    });
  } catch (err) {
    console.error("[expertCalendar.createAvailability]", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to create availability window." });
  }
}

/** DELETE /api/expert/calendar/availability/:id */
async function deleteAvailability(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const { id } = req.params;
    const deleted = await availabilityWindowRepository.deleteById(
      id,
      req.user.userId
    );
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Availability window not found.",
      });
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("[expertCalendar.deleteAvailability]", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to delete availability window." });
  }
}

/** GET /api/expert/calendar/sessions */
async function getSessions(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const sessions = await scheduledSessionRepository.listByExpert(
      req.user.userId,
      { upcomingOnly: false }
    );
    const items = sessions.map((s) => ({
      id: s._id.toString(),
      requirementId: s.requirementId ? s.requirementId.toString() : "",
      companyName: s.companyName,
      sessionType: s.sessionType || "",
      status: s.status,
      scheduledDate: s.scheduledDate,
      startTime: s.startTime || "",
      endTime: s.endTime || "",
      location: s.location || "",
      note: s.note || "",
    }));
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("[expertCalendar.getSessions]", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to load sessions." });
  }
}

/** POST /api/expert/calendar/sessions */
async function createSession(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const {
      companyName,
      sessionType,
      status,
      scheduledDate,
      startTime,
      endTime,
      location,
    } = req.body || {};
    if (!companyName || !scheduledDate) {
      return res.status(400).json({
        success: false,
        error: "companyName and scheduledDate are required.",
      });
    }
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid scheduledDate format.",
      });
    }
    const session = await scheduledSessionRepository.create({
      expertId: req.user.userId,
      companyName: String(companyName).trim(),
      sessionType: (sessionType && String(sessionType).trim()) || "",
      status:
        status === "confirmed" || status === "pending" ? status : "pending",
      scheduledDate: date,
      startTime: (startTime && String(startTime).trim()) || "",
      endTime: (endTime && String(endTime).trim()) || "",
      location: (location && String(location).trim()) || "",
    });
    return res.status(201).json({
      success: true,
      data: {
        id: session._id.toString(),
        companyName: session.companyName,
        sessionType: session.sessionType,
        status: session.status,
        scheduledDate: session.scheduledDate,
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
      },
    });
  } catch (err) {
    console.error("[expertCalendar.createSession]", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to create session." });
  }
}

/** PATCH /api/expert/calendar/sessions/:id */
async function updateSessionStatus(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const { id } = req.params;
    const { status } = req.body || {};
    if (status !== "confirmed" && status !== "pending") {
      return res.status(400).json({
        success: false,
        error: "status must be 'confirmed' or 'pending'.",
      });
    }
    const session = await scheduledSessionRepository.updateStatus(
      id,
      req.user.userId,
      status
    );
    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found.",
      });
    }
    return res.json({
      success: true,
      data: {
        id: session._id.toString(),
        status: session.status,
      },
    });
  } catch (err) {
    console.error("[expertCalendar.updateSessionStatus]", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to update session." });
  }
}

/** GET /api/expert/calendar/stats */
async function getStats(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const expertId = req.user.userId;
    const [activeWindows, upcomingSessions, pending, confirmed] =
      await Promise.all([
        availabilityWindowRepository.countActiveByExpert(expertId),
        scheduledSessionRepository.countUpcomingByExpert(expertId),
        scheduledSessionRepository.countByStatus(expertId, "pending"),
        scheduledSessionRepository.countByStatus(expertId, "confirmed"),
      ]);
    const now = new Date();
    const allSessions = await scheduledSessionRepository.listByExpert(
      expertId,
      { upcomingOnly: false }
    );
    const completed = allSessions.filter(
      (s) => new Date(s.scheduledDate) < now
    ).length;
    return res.json({
      success: true,
      data: {
        activeWindows,
        upcomingSessions,
        pending,
        confirmed,
        completed,
      },
    });
  } catch (err) {
    console.error("[expertCalendar.getStats]", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to load stats." });
  }
}

module.exports = {
  getAvailability,
  createAvailability,
  deleteAvailability,
  getSessions,
  createSession,
  updateSessionStatus,
  getStats,
};
