const express = require("express");
const router = express.Router();
const redemption = require("../controllers/redemption");

/**
 * @openapi
 * /api/redemption:
 *   post:
 *     summary: Submit an investor funds redemption request
 *     tags:
 *       - Redemption
 *     security: []
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
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", redemption.createRedemptionRequest);

module.exports = router;
