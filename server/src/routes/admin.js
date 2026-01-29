const express = require("express");
const { apiKeyOrBearerAdmin } = require("../middleware/apiKey");
const {
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  verifyUser,
  userVerificationStatus,
  createSubAdmin,
  sendNewsletter,
  getRedemptions,
} = require("../controllers/admin");

const router = express.Router();

// Either trusted system (API key) OR admin JWT
router.use(apiKeyOrBearerAdmin);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users (admin or API key)
 *     description: |
 *       Supports pagination + filtering by role/verification status and free-text search.
 *       Authentication can be either an admin JWT (bearerAuth) or a trusted system API key (ApiKeyAuth).
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Page size (max 100)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by verification.status
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [investor, startup, admin, none]
 *         description: Filter by user role. If provided, overrides excludeAdmin.
 *       - in: query
 *         name: excludeAdmin
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Exclude admin users from results (ignored if role is provided)
 *       - in: query
 *         name: onlySubmitted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return only users who have submitted verification (verification.submittedAt exists)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Case-insensitive search across email/name/phone and selected verification fields
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 20 }
 *                     total: { type: integer, example: 133 }
 *                     pages: { type: integer, example: 7 }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.get("/users", getUsers);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       description: |
 *                         Note: admin responses also include computed verification document URLs when present.
 *                       properties:
 *                         verification:
 *                           type: object
 *                           properties:
 *                             documents:
 *                               type: object
 *                               properties:
 *                                 idDocumentUrl:
 *                                   type: string
 *                                   format: uri
 *                                   nullable: true
 *                                 passportPhotoUrl:
 *                                   type: string
 *                                   format: uri
 *                                   nullable: true
 *                                 utilityBillUrl:
 *                                   type: string
 *                                   format: uri
 *                                   nullable: true
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
// GET /api/admin/users/:id
router.get("/users/:id", getUser);

/**
 * @openapi
 * /api/admin/newsletter/send:
 *   post:
 *     tags: [Admin]
 *     summary: Send newsletter email batch (Termii template)
 *     description: |
 *       Sends a single batch to Newsletter subscribers (status=subscribed).
 *       Use limit + cursor to page through recipients for large sends.
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subject, content]
 *             properties:
 *               subject:
 *                 type: string
 *                 example: January newsletter
 *               content:
 *                 type: string
 *                 example: Hello! Here's what's new...
 *               templateId:
 *                 type: string
 *                 description: Optional override for TERMII_TEMPLATE_NEWSLETTER
 *               variables:
 *                 type: object
 *                 description: |
 *                   Extra Termii template variables merged into the default variables.
 *                   Defaults always include: subject, content, unsubscribe_email, unsubscribe_url.
 *                 additionalProperties: true
 *                 properties:
 *                   subject:
 *                     type: string
 *                     description: Optional override for the email subject variable
 *                   content:
 *                     type: string
 *                     description: Optional override for the email content variable
 *                   unsubscribe_email:
 *                     type: string
 *                     format: email
 *                   unsubscribe_url:
 *                     type: string
 *                     format: uri
 *               limit:
 *                 type: number
 *                 description: Batch size (default 100, max 500)
 *               cursor:
 *                 type: string
 *                 description: ObjectId cursor from previous response
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Newsletter batch processed. }
 *                 sent: { type: integer, example: 90 }
 *                 failed: { type: integer, example: 10 }
 *                 failures:
 *                   type: array
 *                   description: Up to 25 failures returned for debugging
 *                   items:
 *                     type: object
 *                     properties:
 *                       email: { type: string, format: email }
 *                       error: { type: string }
 *                 nextCursor:
 *                   type: string
 *                   nullable: true
 *                   description: Pass as cursor in the next request to continue
 *                 batchSize: { type: integer, example: 100 }
 *                 hasMore: { type: boolean, example: true }
 *       400: { description: Bad Request }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post("/newsletter/send", sendNewsletter);

/**
 * @openapi
 * /api/admin/users/{id}/verification-status:
 *   post:
 *     summary: Update verification status of a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: New verification status
 *               rejectionReason:
 *                 type: string
 *                 description: Rejection reason (required if status is rejected)
 *     responses:
 *       200:
 *         description: Verification status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         verification:
 *                           type: object
 *                           properties:
 *                             documents:
 *                               type: object
 *                               properties:
 *                                 idDocumentUrl:
 *                                   type: string
 *                                   format: uri
 *                                   nullable: true
 *                                 passportPhotoUrl:
 *                                   type: string
 *                                   format: uri
 *                                   nullable: true
 *                                 utilityBillUrl:
 *                                   type: string
 *                                   format: uri
 *                                   nullable: true
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
// POST /api/admin/users/:id/verification-status
// body: { status: "approved" | "rejected", rejectionReason?: string }
router.post("/users/:id/verification-status", verifyUser);

/**
 * @openapi
 * /api/admin/users/{id}/verification-status:
 *   get:
 *     summary: Get verification status of a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Verification status retrieved successfully
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
 *                     status:
 *                       type: string
 *                       enum: [none, pending, approved, rejected]
 *                     isVerified:
 *                       type: boolean
 *                     rejectionReason:
 *                       type: string
 *                       description: Reason for rejection if status is rejected
 *                     reviewedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp when the verification was reviewed
 *                     reviewedBy:
 *                       type: string
 *                       description: ID of the admin who reviewed the verification
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp when the verification was submitted
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.get("/users/:id/verification-status", userVerificationStatus);

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, investor, startup, none]
 *                 description: New role for the user
 *     responses:
 *       200:
 *         description: User role updated successfully
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
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *                     phone:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
// PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", updateUserRole);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
// DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUser);

/**
 * @openapi
 * /api/admin/create-sub-admin:
 *   post:
 *     summary: Create a sub-admin user (admin only)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Must end with @financetequecv.com
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: Sub-admin created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post("/create-sub-admin", createSubAdmin);

/**
 * @openapi
 * /api/admin/redemptions:
 *   get:
 *     tags: [Admin]
 *     summary: Get redemption requests
 *     description: |
 *       Returns redemption requests submitted by users.
 *       Supports pagination and basic filtering.
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-based)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Page size (max 100)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ObjectId
 *       - in: query
 *         name: fundType
 *         schema:
 *           type: string
 *           enum: [ethical, equity, debt]
 *         description: Filter by fund type
 *       - in: query
 *         name: redemptionType
 *         schema:
 *           type: string
 *           enum: [partial, full]
 *         description: Filter by redemption type
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Case-insensitive search across investmentId, email, and fullName
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       userId:
 *                         oneOf:
 *                           - type: string
 *                           - type: object
 *                             properties:
 *                               _id: { type: string }
 *                               name: { type: string }
 *                               email: { type: string, format: email }
 *                               phone: { type: string }
 *                               role: { type: string }
 *                       investmentId: { type: string }
 *                       date:
 *                         type: string
 *                         description: Submission date (YYYY-MM-DD)
 *                       fundType:
 *                         type: string
 *                         enum: [ethical, equity, debt]
 *                       amountFigures: { type: string }
 *                       amountWords: { type: string }
 *                       redemptionType:
 *                         type: string
 *                         enum: [partial, full]
 *                       fullName: { type: string }
 *                       address: { type: string }
 *                       city: { type: string }
 *                       lga: { type: string }
 *                       state: { type: string }
 *                       phone: { type: string }
 *                       email: { type: string, format: email }
 *                       bankName: { type: string, nullable: true }
 *                       accountName: { type: string, nullable: true }
 *                       accountNumber: { type: string, nullable: true }
 *                       accountType: { type: string, nullable: true }
 *                       createdAt: { type: string, format: date-time }
 *                       updatedAt: { type: string, format: date-time }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 20 }
 *                     total: { type: integer, example: 133 }
 *                     pages: { type: integer, example: 7 }
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/redemptions", getRedemptions);
module.exports = router;
