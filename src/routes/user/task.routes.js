const express = require("express");
const router = express.Router();
const { createTask, getTaskById, getTasks, updateTask } = require("../../controllers/task.controller");
const { authenticate, validateUserEmail, authorize } = require("../../middleware/auth.middleware");

// create
router.post("/", authenticate, validateUserEmail, createTask);

// list + filters (everyone authenticated + verified)
router.get("/", authenticate, validateUserEmail, getTasks);

// get single
router.get("/:id", authenticate, validateUserEmail, getTaskById);

// update (status/fields)
router.patch("/:id", authenticate, validateUserEmail, updateTask);

module.exports = router;
