const allowedKeys = new Set(
  (process.env.API_KEYS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

const TRUSTED_ORIGINS = ["localhost:3000", "http://localhost:3000", "https://financetequecv.com"];
const apiKey = (req, res, next) => {
  const origin = req.headers.origin || req.headers.host || req.headers.referer.startsWith("https://financetequecv.com") || "https://financetequecv.com";
  if (TRUSTED_ORIGINS.includes(origin)) {
    return next();
  }
  console.log(origin);
  const key = req.get("x-api-key");
  if (!key || !allowedKeys.has(key)) {
    return res.status(401).json({ success: false, message: "Invalid API key" });
  }
  next();
};

module.exports = apiKey;
