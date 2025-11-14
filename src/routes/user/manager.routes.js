// src/routes/manager.routes.js
const express = require("express");
const router = express.Router();
const managerController = require("../../controllers/manager.controller");
const { authenticate, validateUserEmail, authorize } = require("../../middleware/auth.middleware");

// manager actions (manager or admin)
router.post("/create-employee", authenticate, validateUserEmail, authorize("manager", "admin"), managerController.createEmployee);
router.get("/team", authenticate, validateUserEmail, authorize("manager", "admin"), managerController.getTeam);
router.get("/employee/:id", authenticate, validateUserEmail, authorize("manager", "admin"), managerController.getEmployee);
router.patch("/employee/:id", authenticate, validateUserEmail, authorize("manager", "admin"), managerController.updateEmployee);
router.delete("/employee/:id", authenticate, validateUserEmail, authorize("manager", "admin"), managerController.deleteEmployee);

module.exports = router;
