const express = require("express");
const { getActivities } = require("../controllers/activity.controller");
const passport = require("passport");

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
router.get("/", passport.authenticate("jwt", { session: false }), getActivities);

module.exports = router;
