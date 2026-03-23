const express = require("express");
const localAuthRoutes = require("./auth/local.routes");
const oauthRoutes = require("./auth/oauth.routes");
const userProfileRoutes = require("./user/profile.routes");
const taskRoutes = require("./user/task.routes");
const ticketRoutes = require("./user/ticket.routes");
const managerRoutes = require("./user/manager.routes");
const superAdminRoutes = require("./superAdmin.routes");
const adminRoutes = require("./admin.routes");
const attendanceRoutes = require("./user/attendance.routes");
const integrationRoutes = require("./integration.routes");

const router = express.Router();

// Auth routes
router.use("/auth", localAuthRoutes);
router.use("/auth", oauthRoutes);

// User routes
router.use("/users", userProfileRoutes);
router.use("/tasks", taskRoutes);
router.use("/tickets", ticketRoutes);
router.use("/manager", managerRoutes);
router.use("/super-admin", superAdminRoutes);
router.use("/admin", adminRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/integrations", integrationRoutes);


module.exports = router;
