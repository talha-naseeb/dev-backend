const User = require("../models/user.model");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/helpers/asyncHandler");

// @desc    Get Admin Workspace stats (user counts, limits, etc.)
// @route   GET /api/admin/stats
// @access  Admin only
exports.getAdminStats = asyncHandler(async (req, res) => {
  const adminId = req.user._id;

  // Count employees in this workspace
  const totalUsers = await User.countDocuments({ adminRef: adminId });
  
  // Get the admin's limit
  const admin = await User.findById(adminId).select("maxUsersLimit");

  const stats = {
    totalUsers,
    maxUsersLimit: admin.maxUsersLimit,
    activeSessions: 1, // Mock value for now
    activeProjects: 0, // Mock value until projects are implemented
    systemHealth: "98%", // Mock value
  };

  const response = ApiResponse.success("Admin stats retrieved successfully", { stats });
  res.status(response.statusCode).json(response);
});
