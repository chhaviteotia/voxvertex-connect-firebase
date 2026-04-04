const {
  proposalRepository,
  conversationRepository,
  scheduledSessionRepository,
} = require("../repositories");
const { USER_TYPES } = require("../config/constants");

function ensureExpert(req, res) {
  if (!req.user || req.user.type !== USER_TYPES.EXPERT) {
    res.status(403).json({ success: false, error: "Only expert accounts can view analytics." });
    return false;
  }
  return true;
}

function percentDeltaText(recent, prev) {
  if (recent === 0 && prev === 0) return "—";
  if (prev === 0) return recent > 0 ? "+100%" : "—";
  const raw = Math.round(((recent - prev) / prev) * 100);
  return `${raw >= 0 ? "+" : ""}${raw}%`;
}

function rateDeltaText(rateRecent, ratePrev) {
  if (rateRecent == null || ratePrev == null) return "—";
  const diff = Math.round((rateRecent - ratePrev) * 10) / 10;
  if (diff === 0) return "0%";
  return `${diff > 0 ? "+" : ""}${diff} pts`;
}

/**
 * GET /api/expert/analytics
 */
async function getExpertAnalytics(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const expertId = req.user.userId;

    const now = new Date();
    const d30 = new Date(now);
    d30.setDate(d30.getDate() - 30);
    const d60 = new Date(now);
    d60.setDate(d60.getDate() - 60);

    const [proposalStats, convTotal, convLast30, convPrev30, completedTotal, completedLast30, completedPrev30] =
      await Promise.all([
        proposalRepository.getExpertAnalytics(expertId),
        conversationRepository.countByExpertUser(expertId),
        conversationRepository.countByExpertUser(expertId, { createdAt: { $gte: d30 } }),
        conversationRepository.countByExpertUser(expertId, { createdAt: { $gte: d60, $lt: d30 } }),
        scheduledSessionRepository.countCompletedByExpert(expertId),
        scheduledSessionRepository.countCompletedByExpertInRange(expertId, d30, now),
        scheduledSessionRepository.countCompletedByExpertInRange(expertId, d60, d30),
      ]);

    const { byStatus } = proposalStats;
    const accepted = byStatus.accepted || 0;
    const declined = byStatus.declined || 0;
    const decided = accepted + declined;
    const acceptanceOverall = decided > 0 ? Math.round((accepted / decided) * 1000) / 10 : null;

    const volume = Math.min(10, proposalStats.totalSubmitted);
    const convCap = Math.min(10, convTotal);
    const acceptanceComponent = acceptanceOverall != null ? (acceptanceOverall / 100) * 4 : 0;
    let performanceScore = 4 + acceptanceComponent + (volume / 10) * 1.2 + (convCap / 10) * 1.2;
    performanceScore = Math.round(Math.min(10, Math.max(0, performanceScore)) * 10) / 10;

    const monthBuckets = [];
    const cursor = new Date(now);
    cursor.setDate(1);
    cursor.setHours(0, 0, 0, 0);
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short", year: "numeric" });
      monthBuckets.push({ key, label, y: d.getFullYear(), m: d.getMonth() + 1, count: 0 });
    }

    const monthlyMap = new Map();
    for (const row of proposalStats.monthlyRows || []) {
      const k = `${row._id.y}-${String(row._id.m).padStart(2, "0")}`;
      monthlyMap.set(k, row.count);
    }
    for (const b of monthBuckets) {
      b.count = monthlyMap.get(b.key) || 0;
    }

    const topIndustries = (proposalStats.industryRows || [])
      .filter((r) => r.industry && String(r.industry).trim())
      .map((r) => ({
        name: String(r.industry).trim(),
        count: r.count,
      }));

    return res.json({
      success: true,
      metrics: {
        businessConversations: {
          label: "Business conversations",
          value: String(convTotal),
          delta: percentDeltaText(convLast30, convPrev30),
        },
        proposalsSubmitted: {
          label: "Proposals submitted",
          value: String(proposalStats.totalSubmitted),
          delta: percentDeltaText(proposalStats.proposalsLast30, proposalStats.proposalsPrev30),
        },
        acceptanceRate: {
          label: "Acceptance rate",
          value: acceptanceOverall != null ? `${acceptanceOverall}%` : "—",
          delta: rateDeltaText(
            proposalStats.acceptanceWindowLast30,
            proposalStats.acceptanceWindowPrev30
          ),
        },
        avgMatchScore: {
          label: "Avg. match score",
          value: proposalStats.avgMatchScore != null ? `${proposalStats.avgMatchScore}%` : "—",
          delta: "—",
        },
        completedEngagements: {
          label: "Completed engagements",
          value: String(completedTotal),
          delta: percentDeltaText(completedLast30, completedPrev30),
        },
        performanceScore: {
          label: "Performance score",
          value: `${performanceScore}/10`,
          delta: "—",
        },
      },
      performanceOverTime: monthBuckets.map(({ label, count }) => ({ label, count })),
      topIndustries,
    });
  } catch (err) {
    console.error("[expertAnalytics.getExpertAnalytics]", err);
    return res.status(500).json({ success: false, error: "Failed to load analytics." });
  }
}

module.exports = { getExpertAnalytics };
