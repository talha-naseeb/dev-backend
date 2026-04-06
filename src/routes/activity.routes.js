const express = require("express");
const { getActivities } = require("../controllers/activity.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get recent user activity logs
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of recent activities }
 */
router.get("/", authenticate, getActivities);

module.exports = router;
