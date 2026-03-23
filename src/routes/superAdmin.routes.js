const express = require("express");
const router = express.Router();
const superAdminController = require("../controllers/superAdmin.controller");
const { authenticate, isSuperAdmin } = require("../middleware/auth.middleware");

// Protect all super-admin routes
router.use(authenticate, isSuperAdmin);

// Routes
router.get("/clients", superAdminController.getAllClients);
router.put("/clients/:id/tier", superAdminController.updateClientTier);

module.exports = router;
