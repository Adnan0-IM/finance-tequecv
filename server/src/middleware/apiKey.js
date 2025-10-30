const allowedKeys = new Set(
  (process.env.API_KEYS || "")
    .split(/[,\s]+/)
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
    .filter(Boolean)
);

const apiKey = (req, res, next) => {
  const header = req.get("x-api-key");
  if (!header)
    return res.status(401).json({ success: false, message: "Invalid API key" });
  const candidates = header
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const valid = candidates.some((k) => allowedKeys.has(k));
  if (!valid)
    return res.status(401).json({ success: false, message: "Invalid API key" });
  next();
};

// Allow either API key OR Bearer admin JWT
const { protect } = require("./auth");
const apiKeyOrBearerAdmin = (req, res, next) => {
  const header = req.get("x-api-key");
  if (header) {
    const candidates = header
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (candidates.some((k) => allowedKeys.has(k))) return next();
    return res.status(401).json({ success: false, message: "Invalid API key" });
  }
  // Fallback to JWT and require admin role
  protect(req, res, () => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  });
};

module.exports = { apiKey, apiKeyOrBearerAdmin };
