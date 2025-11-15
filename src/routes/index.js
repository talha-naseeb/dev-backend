const express = require("express");
const localAuthRoutes = require("./auth/local.routes");
const oauthRoutes = require("./auth/oauth.routes");
const userProfileRoutes = require("./user/profile.routes");
const taskRoutes = require("./user/task.routes");
const ticketRoutes = require("./user/ticket.routes");
const managerRoutes = require("./user/manager.routes");

const router = express.Router();

// Auth routes
router.use("/auth", localAuthRoutes);
router.use("/auth", oauthRoutes);

// User routes
router.use("/users", userProfileRoutes);
router.use("/tasks", taskRoutes);
router.use("/tickets", ticketRoutes);
router.use("/manager", managerRoutes);


module.exports = router;
