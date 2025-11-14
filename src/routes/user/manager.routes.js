const express = require("express");
const router = express.Router();
const {createEmployee, getTeam, getEmployee, updateEmployee, deleteEmployee} = require("../../controllers/manager.controller");
const { authenticate, validateUserEmail, authorize } = require("../../middleware/auth.middleware");

// manager actions (manager or admin)
router.post("/create-employee", authenticate, validateUserEmail, authorize("manager", "admin"), createEmployee);
router.get("/team", authenticate, validateUserEmail, authorize("manager", "admin"), getTeam);
router.get("/employee/:id", authenticate, validateUserEmail, authorize("manager", "admin"), getEmployee);
router.patch("/employee/:id", authenticate, validateUserEmail, authorize("manager", "admin"), updateEmployee);
router.delete("/employee/:id", authenticate, validateUserEmail, authorize("manager", "admin"), deleteEmployee);

module.exports = router;
