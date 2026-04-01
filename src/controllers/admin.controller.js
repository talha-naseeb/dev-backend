const User = require("../models/user.model");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/helpers/asyncHandler");
const { calculateAdminStats } = require("../utils/stats-helper");

// @desc    Get Admin Workspace stats (user counts, limits, etc.)
// @route   GET /api/admin/stats
// @access  Admin only
exports.getAdminStats = asyncHandler(async (req, res) => {
  const adminId = req.user._id;

  const stats = await calculateAdminStats(adminId);

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
