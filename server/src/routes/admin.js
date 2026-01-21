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
 *     security:
 *       - bearerAuth: []
 *       - ApiKeyAuth: []
 *     responses:
 *       200: { description: OK }
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
 *         ApiKeyAuth: []
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
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [investor, startup, admin]
 *                     isVerified:
 *                       type: boolean
 *                     verification:
 *                       type: object
 *                       properties:
 *                         personal:
 *                           type: object
 *                           properties:
 *                             firstName:
 *                               type: string
 *                             surname:
 *                               type: string
 *                             dateOfBirth:
 *                               type: string
 *                             localGovernment:
 *                               type: string
 *                             stateOfResidence:
 *                               type: string
 *                             residentialAddress:
 *                               type: string
 *                             ninNumber:
 *                               type: string
 *                         nextOfKin:
 *                           type: object
 *                           properties:
 *                             fullName:
 *                               type: string
 *                             phoneNumber:
 *                               type: string
 *                             email:
 *                               type: string
 *                             residentialAddress:
 *                               type: string
 *                             relationship:
 *                               type: string
 *                         bankDetails:
 *                           type: object
 *                           properties:
 *                             accountName:
 *                               type: string
 *                             accountNumber:
 *                               type: string
 *                             bankName:
 *                               type: string
 *                             bvnNumber:
 *                               type: string
 *                             accountType:
 *                               type: string
 *                         documents:
 *                           type: object
 *                           properties:
 *                             idDocument:
 *                               type: string
 *                             idDocumentUrl:
 *                               type: string
 *                             passportPhoto:
 *                               type: string
 *                             passportPhotoUrl:
 *                               type: string
 *                             utilityBill:
 *                               type: string
 *                             utilityBillUrl:
 *                               type: string
 *                         status:
 *                           type: string
 *                           enum: [pending, approved, rejected]
 *                         rejectionReason:
 *                           type: string
 *                         reviewedAt:
 *                           type: string
 *                           format: date-time
 *                         reviewedBy:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       _id:
 *                         type: string
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
 *               content:
 *                 type: string
 *               templateId:
 *                 type: string
 *                 description: Optional override for TERMII_TEMPLATE_NEWSLETTER
 *               variables:
 *                 type: object
 *                 description: Extra Termii template variables
 *               limit:
 *                 type: number
 *                 description: Batch size (default 100, max 500)
 *               cursor:
 *                 type: string
 *                 description: ObjectId cursor from previous response
 *     responses:
 *       200: { description: OK }
 *       400: { description: Bad Request }
 *       401: { description: Unauthorized }
 *       403: { description: Forbidden }
 */
router.post("/newsletter/send", sendNewsletter);

/**
 * @openapi
 * /api/admin/users/{id}/verification-status:
 *   patch:
 *     summary: Update verification status of a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *         ApiKeyAuth: []
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
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [investor, startup, admin]
 *                       isVerified:
 *                         type: boolean
 *                       verification:
 *                         type: object
 *                         properties:
 *                           personal:
 *                             type: object
 *                             properties:
 *                               firstName:
 *                                 type: string
 *                               surname:
 *                                 type: string
 *                               dateOfBirth:
 *                                 type: string
 *                               localGovernment:
 *                                 type: string
 *                               stateOfResidence:
 *                                 type: string
 *                               residentialAddress:
 *                                 type: string
 *                               ninNumber:
 *                                 type: string
 *                           nextOfKin:
 *                             type: object
 *                             properties:
 *                               fullName:
 *                                 type: string
 *                               phoneNumber:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               residentialAddress:
 *                                 type: string
 *                               relationship:
 *                                 type: string
 *                           bankDetails:
 *                             type: object
 *                             properties:
 *                               accountName:
 *                                 type: string
 *                               accountNumber:
 *                                 type: string
 *                               bankName:
 *                                 type: string
 *                               bvnNumber:
 *                                 type: string
 *                               accountType:
 *                                 type: string
 *                           documents:
 *                             type: object
 *                             properties:
 *                               idDocument:
 *                                 type: string
 *                               idDocumentUrl:
 *                                 type: string
 *                               passportPhoto:
 *                                 type: string
 *                               passportPhotoUrl:
 *                                 type: string
 *                               utilityBill:
 *                                 type: string
 *                               utilityBillUrl:
 *                                 type: string
 *                           status:
 *                             type: string
 *                             enum: [pending, approved, rejected]
 *                           rejectionReason:
 *                             type: string
 *                           reviewedAt:
 *                             type: string
 *                           reviewedBy:
 *                             type: string
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
// PATCH /api/admin/users/:id/verification-status
// body: { status: "approved" | "rejected", rejectionReason?: string }
router.patch("/users/:id/verification-status", verifyUser);

/**
 * @openapi
 * /api/admin/users/{id}/verification-status:
 *   get:
 *     summary: Get verification status of a user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *         ApiKeyAuth: []
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
 *                     verifiedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Timestamp when the user was verified
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
 *         ApiKeyAuth: []
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
 *                 enum: [admin, investor, startup]
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
 *                     id:
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
 *                     _id:
 *                       type: string
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
 *         ApiKeyAuth: []
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
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post("/create-sub-admin", createSubAdmin);

module.exports = router;
