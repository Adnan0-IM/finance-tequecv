const express = require("express");
const router = express.Router();
const controller = require("../controllers/carousel");

/**
 * @openapi
 * /api/carousel:
 *   get:
 *     summary: List carousel items
 *     tags: [Carousel]
 *     responses:
 *       200:
 *         description: Array of carousel items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       title: { type: string }
 *                       description: { type: string }
 *                       image: { type: string, description: "URL or /path" }
 *                       link: { type: string, description: "Optional URL or /path" }
 *                       createdAt: { type: string, format: date-time }
 */
router.get("/", controller.list);

/**
 * @openapi
 * /api/carousel:
 *   post:
 *     summary: Create a carousel item
 *     tags: [Carousel]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               image:
 *                 type: string
 *                 description: Image URL or /uploads path
 *               link:
 *                 type: string
 *                 description: Optional URL or /path
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Validation error
 */
router.post("/", controller.create);

/**
 * @openapi
 * /api/carousel/{id}:
 *   put:
 *     summary: Update a carousel item
 *     tags: [Carousel]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               image: { type: string, description: "URL or /path" }
 *               link: { type: string, description: "URL or /path" }
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Item not found
 */
router.put("/:id", controller.update);

/**
 * @openapi
 * /api/carousel/{id}:
 *   delete:
 *     summary: Delete a carousel item
 *     tags: [Carousel]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 *       400:
 *         description: Invalid id
 *       404:
 *         description: Item not found
 */
router.delete("/:id", controller.remove);

module.exports = router;
