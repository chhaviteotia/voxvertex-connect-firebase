const { requirementRepository } = require("../repositories");
const { USER_TYPES } = require("../config/constants");

function ensureExpert(req, res) {
  if (!req.user || req.user.type !== USER_TYPES.EXPERT) {
    res.status(403).json({
      success: false,
      error: "Only expert accounts can access opportunities.",
    });
    return false;
  }
  return true;
}

/**
 * GET /api/expert/opportunities
 * Returns published requirements (opportunities) for experts.
 */
async function getOpportunities(req, res) {
  try {
    if (!ensureExpert(req, res)) return;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const skip = parseInt(req.query.skip, 10) || 0;
    const search = String(req.query.search || "").trim().toLowerCase();
    const domain = String(req.query.domain || "").trim().toLowerCase();
    const budget = String(req.query.budget || "").trim().toLowerCase();
    const type = String(req.query.type || "").trim().toLowerCase();

    // Pull published requirements once, then filter/paginate deterministically.
    // This keeps the API simple while still supporting complex filter semantics.
    const allPublished = await requirementRepository.listPublished({ limit: 2000, skip: 0 });

    const toTitleCase = (value = "") =>
      String(value)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (ch) => ch.toUpperCase());

    const budgetBandOf = (minBudget, maxBudget) => {
      const upper = Number.isFinite(maxBudget) && maxBudget > 0 ? maxBudget : minBudget;
      if (!Number.isFinite(upper) || upper <= 0) return "not-specified";
      if (upper < 100000) return "under-100k";
      if (upper <= 300000) return "100k-300k";
      return "above-300k";
    };

    const typeOf = (engagementTypeRaw) => {
      const value = String(engagementTypeRaw || "").toLowerCase();
      if (!value) return "other";
      if (
        value.includes("workshop") ||
        value.includes("bootcamp") ||
        value.includes("masterclass") ||
        value.includes("implementation")
      )
        return "workshop";
      if (value.includes("training")) return "training";
      if (
        value.includes("coaching") ||
        value.includes("mentorship") ||
        value.includes("advisory")
      )
        return "coaching";
      if (
        value.includes("keynote") ||
        value.includes("panel") ||
        value.includes("fireside") ||
        value.includes("webinar") ||
        value.includes("speaking")
      )
        return "speaking";
      return "other";
    };

    const normalized = allPublished.map((doc) => {
      const createdBy = doc.createdBy || {};
      const formData = doc.formData || {};
      const selectedOutcome = String(formData.selectedOutcome || "").toLowerCase();
      const objectiveTitle = selectedOutcome ? toTitleCase(selectedOutcome) : "";
      const objectiveText = String(formData.objective || formData.successMetrics || "").toLowerCase();
      const companyName = String(createdBy.companyName || "Company");
      const minBudget = Number(formData.minBudget);
      const maxBudget = Number(formData.maxBudget);
      const engagementType = String(formData.engagementTypeSelected || "");

      return {
        id: doc._id.toString(),
        createdAt: doc.createdAt,
        companyName,
        formData,
        _domain: selectedOutcome,
        _objectiveTitle: objectiveTitle,
        _objectiveText: objectiveText,
        _companySearch: companyName.toLowerCase(),
        _budgetBand: budgetBandOf(minBudget, maxBudget),
        _type: typeOf(engagementType),
      };
    });

    const filtered = normalized.filter((item) => {
      if (domain && domain !== "all" && item._domain !== domain) return false;
      if (budget && budget !== "all" && item._budgetBand !== budget) return false;
      if (type && type !== "all" && item._type !== type) return false;
      if (search) {
        const inCompany = item._companySearch.includes(search);
        const inObjective =
          item._objectiveTitle.toLowerCase().includes(search) ||
          item._objectiveText.includes(search);
        if (!inCompany && !inObjective) return false;
      }
      return true;
    });

    const page = filtered.slice(skip, skip + limit);
    const opportunities = page.map((doc) => {
      return {
        id: doc.id,
        createdAt: doc.createdAt,
        companyName: doc.companyName || "Company",
        formData: doc.formData || {},
      };
    });

    const domainOptionsDynamic = Array.from(
      new Set(
        normalized
          .map((item) => item._domain)
          .filter(Boolean)
      )
    )
      .sort()
      .map((slug) => ({ value: slug, label: toTitleCase(slug) }));

    const domainOptionsFallback = [
      { value: "skill-development", label: "Skill Development" },
      { value: "revenue-generation", label: "Revenue Generation" },
      { value: "hiring-talent", label: "Hiring & Talent" },
      { value: "brand-positioning", label: "Brand Positioning" },
      { value: "leadership-alignment", label: "Leadership Alignment" },
      { value: "innovation-problem-solving", label: "Innovation & Problem Solving" },
      { value: "compliance-risk", label: "Compliance & Risk" },
      { value: "community-networking", label: "Community & Networking" },
      { value: "product-adoption", label: "Product Adoption" },
      { value: "behavior-change", label: "Behavior Change" },
    ];
    const domainOptions = domainOptionsDynamic.length > 0 ? domainOptionsDynamic : domainOptionsFallback;

    const budgetOptions = [
      { value: "under-100k", label: "Under ₹1,00,000" },
      { value: "100k-300k", label: "₹1,00,000 - ₹3,00,000" },
      { value: "above-300k", label: "Above ₹3,00,000" },
    ];

    const typeOptions = [
      { value: "workshop", label: "Workshop" },
      { value: "training", label: "Training Session" },
      { value: "coaching", label: "Coaching" },
      { value: "speaking", label: "Speaking" },
    ];

    return res.json({
      success: true,
      data: opportunities,
      total: filtered.length,
      filters: { domains: domainOptions, budgets: budgetOptions, types: typeOptions },
    });
  } catch (err) {
    console.error("[expertOpportunities.getOpportunities]", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to load opportunities." });
  }
}

module.exports = { getOpportunities };
