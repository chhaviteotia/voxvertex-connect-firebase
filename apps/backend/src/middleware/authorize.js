const { USER_TYPES } = require("../config/constants");

function requireRole(...allowedRoles) {
  const normalized = new Set(
    allowedRoles
      .map((role) => String(role || "").trim().toLowerCase())
      .filter(Boolean)
  );

  return function roleGuard(req, res, next) {
    const current = String(req.user?.type || "").trim().toLowerCase();
    if (!current || !normalized.has(current)) {
      const roleLabel = Array.from(normalized)
        .map((role) => (role === USER_TYPES.BUSINESS ? "business" : role === USER_TYPES.EXPERT ? "expert" : role))
        .join(" or ");
      return res.status(403).json({
        success: false,
        error: `Access denied. ${roleLabel || "Authorized"} account required.`,
      });
    }
    return next();
  };
}

module.exports = { requireRole };
