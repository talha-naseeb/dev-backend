const asyncHandler = require("../utils/helpers/asyncHandler");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const User = require("../models/user.model");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private (Verified Users)

exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) throw ApiError.notFound("User not found");

  const response = ApiResponse.success("Profile retrieved successfully", { user });
  res.status(response.statusCode).json(response);
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (Verified Users)
exports.updateUserProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "mobileNumber", "personalEmail", "jobDescription", "department", "companyName"];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  // ✅ Handle optional profile image
  if (req.files?.profileImage && req.files.profileImage[0]) {
    const result = await uploadToCloudinary(req.files.profileImage[0].buffer, "profile_images");
    updates.profileImage = result.secure_url;
  }

  // ✅ Handle optional company logo
  if (req.files?.companyLogo && req.files.companyLogo[0]) {
    const result = await uploadToCloudinary(req.files.companyLogo[0].buffer, "company_logos");
    updates.companyLogo = result.secure_url;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) throw ApiError.notFound("User not found");

  const response = ApiResponse.success("Profile updated successfully", { user });
  res.status(response.statusCode).json(response);
});

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private (Authenticated)
exports.logoutUser = asyncHandler(async (req, res) => {
  req.user = null;
  req.token = null;

  const response = ApiResponse.success("Logged out successfully");
  console.log("Logout:", response);
  res.status(response.statusCode).json(response);
});

// @desc    Admin only - Get all users
// @route   GET /api/users/all
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  const response = ApiResponse.success("Users retrieved successfully", { users });
  res.status(response.statusCode).json(response);
});
