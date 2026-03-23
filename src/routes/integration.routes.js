const express = require("express");
const router = express.Router();
const integrationController = require("../controllers/integration.controller");
const { authenticate, isAdmin } = require("../middleware/auth.middleware");

// Protect all integration routes (Admin only)
router.use(authenticate, isAdmin);

// Routes
router.get("/", integrationController.getIntegrations);
router.post("/toggle", integrationController.toggleIntegration);
router.patch("/:type", integrationController.updateConfig);

module.exports = router;
