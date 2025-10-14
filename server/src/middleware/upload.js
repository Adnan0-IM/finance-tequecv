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
const allowedMime = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);
const allowedExt = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (allowedMime.has(file.mimetype) || allowedExt.has(ext)) {
    return cb(null, true);
  }
  cb(new Error(`Invalid file type: ${file.mimetype || ext}`), false);
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
