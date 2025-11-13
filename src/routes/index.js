const express = require("express");
const localAuthRoutes = require("./auth/local.routes");
const oauthRoutes = require("./auth/oauth.routes");
const userProfileRoutes = require("./user/profile.routes");

const router = express.Router();

// Auth routes
router.use("/auth", localAuthRoutes);
router.use("/auth", oauthRoutes);

// User routes
router.use("/users", userProfileRoutes);

module.exports = router;
