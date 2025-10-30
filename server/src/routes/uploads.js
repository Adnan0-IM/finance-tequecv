const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Central uploads dir (same as server.js)
const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.join(__dirname, "..", "uploads");

// Ensure destination exists
const ensureDir = (dir) => fs.mkdirSync(dir, { recursive: true });

const destDir = path.join(UPLOADS_DIR, "carousel");
ensureDir(destDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, destDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^\w\-]+/g, "")
      .slice(0, 40);
    const uniq = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base || "image"}-${uniq}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Invalid file type: only images."));
    }
    cb(null, true);
  },
});

/**
 * @openapi
 * /api/uploads/carousel:
 *   post:
 *     summary: Upload a carousel image
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (max 5MB)
 *     responses:
 *       201:
 *         description: Image uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 url: { type: string, example: "/uploads/carousel/image-123.jpg" }
 *                 absoluteUrl: { type: string, example: "http://localhost:3000/uploads/carousel/image-123.jpg" }
 *       400:
 *         description: No file or invalid type
 */
router.post("/carousel", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  }
  const webPath = `/uploads/carousel/${req.file.filename}`;
  const base = `${req.protocol}://${req.get("host")}`;
  res
    .status(201)
    .json({ success: true, url: webPath, absoluteUrl: `${base}${webPath}` });
});

module.exports = router;
