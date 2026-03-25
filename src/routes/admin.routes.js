const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { authenticate, isAdmin } = require("../middleware/auth.middleware");

// Protect all admin routes
router.use(authenticate, isAdmin);

// Routes
router.get("/stats", adminController.getAdminStats);
router.get("/trends", adminController.getAdminTrends);

module.exports = router;
