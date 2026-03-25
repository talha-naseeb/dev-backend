const Attendance = require("../models/attendance.model");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/helpers/asyncHandler");

// @desc    Clock-In (Create or update attendance for today)
// @route   POST /api/attendance/clock-in
// @access  Authenticated
exports.clockIn = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const adminId = req.user.adminRef || req.user._id; // Use self as admin if admin
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already clocked in today
  let attendance = await Attendance.findOne({ user: userId, date: today });

  if (attendance && attendance.loginTime) {
    throw ApiError.badRequest("Already clocked in for today");
  }

  if (!attendance) {
    attendance = new Attendance({
      user: userId,
      adminRef: adminId,
      date: today,
      loginTime: new Date(),
      status: "present",
    });
  } else {
    attendance.loginTime = new Date();
  }

  await attendance.save();

  // Real-time update to Admin
  const io = req.app.get("io");
  if (io) {
    io.to(adminId.toString()).emit("attendance:update", { 
      type: "clock-in", 
      userId, 
      userName: req.user.name 
    });
  }

  res.status(200).json(ApiResponse.success("Clock-in successful", { attendance }));
});

// @desc    Clock-Out
// @route   POST /api/attendance/clock-out
// @access  Authenticated
exports.clockOut = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({ user: userId, date: today });

  if (!attendance) {
    throw ApiError.notFound("No attendance record found for today. Please clock-in first.");
  }

  if (attendance.logoutTime) {
    throw ApiError.badRequest("Already clocked out for today");
  }

  attendance.logoutTime = new Date();
  
  // Calculate total hours
  if (attendance.loginTime) {
    const diffMs = attendance.logoutTime - attendance.loginTime;
    attendance.totalHours = (diffMs / (1000 * 60 * 60)).toFixed(2);
  }

  await attendance.save();

  // Real-time update to Admin
  const adminId = req.user.adminRef || req.user._id;
  const io = req.app.get("io");
  if (io) {
    io.to(adminId.toString()).emit("attendance:update", { 
      type: "clock-out", 
      userId, 
      userName: req.user.name 
    });
  }

  res.status(200).json(ApiResponse.success("Clock-out successful", { attendance }));
});

// @desc    Get my attendance history
// @route   GET /api/attendance/my-history
// @access  Authenticated
exports.getMyHistory = asyncHandler(async (req, res) => {
  const history = await Attendance.find({ user: req.user._id }).sort({ date: -1 }).limit(30);
  res.status(200).json(ApiResponse.success("Attendance history retrieved", { history }));
});

// @desc    Admin/Manager: Get workspace attendance
// @route   GET /api/attendance/workspace
// @access  Admin/Manager
exports.getWorkspaceAttendance = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const adminId = isAdmin ? req.user._id : req.user.adminRef;

  const attendance = await Attendance.find({ adminRef: adminId })
    .populate("user", "name email role")
    .sort({ date: -1 });

  res.status(200).json(ApiResponse.success("Workspace attendance retrieved", { attendance }));
});
