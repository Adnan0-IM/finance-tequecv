const express = require("express");
const {
  submitVerification,
  uploadDocuments,
  getVerificationStatus,
  submitCorporateVerification,
  submitCorporateVerificationDocuments,
} = require("../controllers/verification");
const { protect } = require("../middleware/auth");
const { upload, uploadCorporate } = require("../middleware/upload");

const router = express.Router();

/**
 * @openapi
 * /api/verification:
 *   post:
 *     summary: Submit verification information
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - residentialAddress
 *             properties:
 *               firstName: { type: string }
 *               surname: { type: string }
 *               phoneNumber: { type: string }
 *               ageBracket: { type: string }
 *               dateOfBirth: { type: string, format: date }
 *               localGovernment: { type: string }
 *               stateOfResidence: { type: string }
 *               residentialAddress: { type: string }
 *               ninNumber: { type: string }
 *               kinFullName: { type: string }
 *               kinPhoneNumber: { type: string }
 *               kinEmail: { type: string, format: email }
 *               kinResidentialAddress: { type: string }
 *               kinRelationship: { type: string }
 *               accountName: { type: string }
 *               accountNumber: { type: string }
 *               bankName: { type: string }
 *               bvnNumber: { type: string }
 *               accountType: { type: string }
 *     responses:
 *       200:
 *         description: Verification information submitted successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 */
router.post("/", protect, submitVerification);

/**
 * @openapi
 * /api/verification/documents:
 *   post:
 *     summary: Upload verification documents
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - identificationDocument
 *               - passportPhoto
 *               - utilityBill
 *             properties:
 *               identificationDocument:
 *                 type: string
 *                 format: binary
 *                 description: Government-issued ID (PNG, JPG, PDF)
 *               passportPhoto:
 *                 type: string
 *                 format: binary
 *                 description: Recent passport photo (PNG, JPG)
 *               utilityBill:
 *                 type: string
 *                 format: binary
 *                 description: Recent utility bill (PNG, JPG, PDF)
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       400:
 *         description: Invalid file type or upload error
 *       401:
 *         description: Not authenticated
 */
router.post(
  "/documents",
  protect,
  upload.fields([
    { name: "identificationDocument", maxCount: 1 },
    { name: "passportPhoto", maxCount: 1 },
    { name: "utilityBill", maxCount: 1 },
  ]),
  (err, req, res, next) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ success: false, message: "File too large (max 5MB)" });
    }
    return res
      .status(400)
      .json({ success: false, message: err.message || "Upload error" });
  },
  uploadDocuments
);

/**
 * @openapi
 * /api/verification/status:
 *   get:
 *     summary: Get user's verification status
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification status retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get("/status", protect, getVerificationStatus);

/**
 * @openapi
 * /api/verification/corporate:
 *   post:
 *     summary: Submit corporate verification (text fields)
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company, bankDetails, signatories]
 *             properties:
 *               company:
 *                 type: object
 *                 description: Company details
 *               bankDetails:
 *                 type: object
 *                 description: Company bank details
 *               signatories:
 *                 type: array
 *                 description: At least one signatory is required
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     email: { type: string, format: email }
 *                     phone: { type: string }
 *               referral:
 *                 type: object
 *                 description: Optional referral info
 *     responses:
 *       201:
 *         description: Corporate verification saved
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 */
router.post("/corporate", protect, submitCorporateVerification);

/**
 * @openapi
 * /api/verification/corporate/documents:
 *   post:
 *     summary: Upload corporate verification documents
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               companyLogo:
 *                 type: string
 *                 format: binary
 *               certificateOfIncorporation:
 *                 type: string
 *                 format: binary
 *               memorandumAndArticles:
 *                 type: string
 *                 format: binary
 *               utilityBill:
 *                 type: string
 *                 format: binary
 *               tinCertificate:
 *                 type: string
 *                 format: binary
 *               signatories[0][idDocument]:
 *                 type: string
 *                 format: binary
 *                 description: ID document for signatory index 0
 *               signatories[0][signature]:
 *                 type: string
 *                 format: binary
 *                 description: Signature image for signatory index 0
 *               signatories[1][idDocument]:
 *                 type: string
 *                 format: binary
 *               signatories[1][signature]:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Corporate documents uploaded successfully
 *       400:
 *         description: Invalid upload
 *       401:
 *         description: Not authenticated
 */
router.post(
  "/corporate/documents",
  protect,
  (req, res, next) => {
    uploadCorporate.any()(req, res, (err) => {
      if (!err) return next();
      // Normalize Multer errors
      if (err.code === "LIMIT_FILE_COUNT") {
        return res
          .status(400)
          .json({ success: false, message: "Too many files" });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({ success: false, message: "File too large (max 5MB)" });
      }
      return res
        .status(400)
        .json({ success: false, message: err.message || "Upload error" });
    });
  },
  submitCorporateVerificationDocuments
);

module.exports = router;
