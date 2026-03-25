const User = require("../models/user.model");
const Attendance = require("../models/attendance.model");
const Task = require("../models/task.model");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/helpers/asyncHandler");

// @desc    Get Admin Workspace stats (user counts, limits, etc.)
// @route   GET /api/admin/stats
// @access  Admin only
exports.getAdminStats = asyncHandler(async (req, res) => {
  const adminId = req.user._id;

  // 1. Total Employees in this workspace
  const totalUsers = await User.countDocuments({ adminRef: adminId });
  
  // 2. Active Sessions (Clocked in today but not yet clocked out)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activeSessions = await Attendance.countDocuments({
    adminRef: adminId,
    date: { $gte: today },
    logoutTime: { $exists: false }
  });

  // 3. Active Projects (Unique tasks that are in-progress or pending)
  const activeProjects = await Task.countDocuments({
    adminRef: adminId,
    status: { $in: ["pending", "in-progress", "in-review"] }
  });
  
  // 4. Get the admin's limit (already implemented)
  const admin = await User.findById(adminId).select("maxUsersLimit");

  const stats = {
    totalUsers,
    maxUsersLimit: admin.maxUsersLimit || 3,
    activeSessions,
    activeProjects,
    systemHealth: "Active",
  };

  const response = ApiResponse.success("Admin stats retrieved successfully", { stats });
  res.status(response.statusCode).json(response);
});

// @desc    Get Admin Workspace trends (last 7 days activity)
// @route   GET /api/admin/trends
// @access  Admin only
exports.getAdminTrends = asyncHandler(async (req, res) => {
  const adminId = req.user._id;
  
  // Last 7 days aggregation for ActivityAnalytic
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
     const d = new Date();
     d.setDate(d.getDate() - i);
     d.setHours(0, 0, 0, 0);
     last7Days.push({
       date: d,
       day: d.toLocaleDateString('en-US', { weekday: 'short' }),
       activity: Math.floor(Math.random() * (95 - 60 + 1)) + 60 // Real aggregation would look at Task completion/logs
     });
  }

  // Work trends (Productive vs Unproductive) for last 6 months
  const last6Months = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = new Date().getMonth();

  for (let i = 5; i >= 0; i--) {
    const mIndex = (currentMonth - i + 12) % 12;
    last6Months.push({
      month: monthNames[mIndex],
      productive: Math.floor(Math.random() * 12) + 5,
      unproductive: Math.floor(Math.random() * 5) + 1
    });
  }

  const response = ApiResponse.success("Admin trends retrieved successfully", { 
    activityTrends: last7Days,
    workTrends: last6Months
  });
  res.status(response.statusCode).json(response);
});
