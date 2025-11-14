// src/routes/task.routes.js
const express = require("express");
const router = express.Router();
const taskController = require("../../controllers/task.controller");
const { authenticate, validateUserEmail, authorize } = require("../../middleware/auth.middleware");

// create
router.post("/", authenticate, validateUserEmail, authorize("manager", "admin"), taskController.createTask);

// list + filters (everyone authenticated + verified)
router.get("/", authenticate, validateUserEmail, taskController.getTasks);

// get single
router.get("/:id", authenticate, validateUserEmail, taskController.getTaskById);

// update (status/fields)
router.patch("/:id", authenticate, validateUserEmail, taskController.updateTask);

module.exports = router;
