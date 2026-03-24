const Activity = require("../models/activity.model");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/helpers/asyncHandler");

// @desc    Get recent activities for the workspace
// @route   GET /api/activities
// @access  Private
exports.getActivities = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const adminId = isAdmin ? req.user._id : req.user.adminRef;

  const activities = await Activity.find({ adminRef: adminId })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("user", "name role");

  res.status(200).json(ApiResponse.success("Activities retrieved", { activities }));
});
