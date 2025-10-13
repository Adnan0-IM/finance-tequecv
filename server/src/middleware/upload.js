const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Central uploads dir (same as server.js)
const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads");

const uploadDir = path.join(UPLOADS_DIR, "verification");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});

// Accept PDFs and images
const allowed = new Set(["application/pdf", "image/jpeg", "image/png"]);
const fileFilter = (req, file, cb) => {
  if (allowed.has(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid file type"), false);
};

// Default uploader (personal KYC)
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

// Corporate uploader with higher files cap
const uploadCorporate = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 30 },
});

module.exports = { upload, uploadCorporate };
