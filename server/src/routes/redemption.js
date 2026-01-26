const express = require("express");
const router = express.Router();
const redemption = require("../controllers/redemption");
const { protect } = require("../middleware/auth");

/**
 * @openapi
 * /api/redemption:
 *   post:
 *     summary: Submit an investor funds redemption request
 *     tags:
 *       - Redemption
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RedemptionRequestCreate'
 *     responses:
 *       201:
 *         description: Redemption request submitted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RedemptionRequestCreateResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", protect, redemption.createRedemptionRequest);

/**
 * @openapi
 * /api/redemption/bank-details:
 *   get:
 *     summary: Get default bank details for redemption
 *     tags:
 *       - Redemption
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bank details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     bankName:
 *                       type: string
 *                       example: "Finance Teque Bank"
 *                     accountName:
 *                       type: string
 *                       example: "Finance Teque Investments"
 *                     accountNumber:
 *                       type: string
 *                       example: "0123456789"
 *                     accountType:
 *                       type: string
 *                       example: "savings"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/bank-details", protect, redemption.getBankDetails);

module.exports = router;
