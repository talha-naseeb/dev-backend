const express = require("express");
const router = express.Router();
const attendanceController = require("../../controllers/attendance.controller");
const { authenticate, authorize } = require("../../middleware/auth.middleware");

// clock-in/out
router.post("/clock-in", authenticate, attendanceController.clockIn);
router.post("/clock-out", authenticate, attendanceController.clockOut);

// my history
router.get("/my-history", authenticate, attendanceController.getMyHistory);

// workspace overview (manager/admin)
router.get("/workspace", authenticate, authorize("manager", "admin"), attendanceController.getWorkspaceAttendance);

module.exports = router;
