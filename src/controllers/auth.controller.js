const User = require("../models/user.model");
const { sendResetPasswordEmail, sendVerificationEmail } = require("../utils/email");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/helpers/asyncHandler");
const crypto = require("crypto");
const { generateToken } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/helpers/authHelpers");

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, mobileNumber, role } = req.body;

  // 🔹 Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.conflict("Email already exists");

  // Hash the password
  const hashedPassword = await hashPassword(password);

  // Create email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

  const verificationExpires = Date.now() + 1000 * 60 * 60; // 1 hour expiry

  // Create user
  const user = new User({
    name,
    email,
    mobileNumber,
    password: hashedPassword,
    role,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: verificationExpires,
    isVerified: false,
  });

  await user.save();

  // Send verification email
  await sendVerificationEmail(user.email, verificationToken);

  const response = ApiResponse.created("User registered successfully. Please verify your email.");
  res.status(response.statusCode).json(response);
});

// @desc    verify user email
// @route   POST /api/auth/verify-email
// @access  Public

exports.verifyUserEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) throw ApiError.badRequest("Verification token is required");

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest("Invalid or expired verification link");
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  const response = ApiResponse.success("Email verified successfully");
  res.status(response.statusCode).json(response);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.unauthorized("User not found!");
  }

  // comparePassword will throw an error if passwords don't match
  await comparePassword(password, user.password);

  const token = generateToken(user);
  const response = ApiResponse.success("Login successful", { token });
  res.status(response.statusCode).json(response);
});

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes

  await user.save();
  await sendResetPasswordEmail(user.email, resetToken);

  const response = ApiResponse.success("Reset password email sent successfully");
  res.status(response.statusCode).json(response);
});

// @desc    Verify reset password token
// @route   GET /api/auth/verify-reset-token?token=abc123
// @access  Public
exports.verifyResetToken = asyncHandler(async (req, res) => {
  const { token } = req.query; // get from query params

  if (!token) {
    throw ApiError.badRequest("Token is required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest("Invalid or expired token");
  }

  // Return user info (email) for frontend display
  const response = ApiResponse.success("Token is Valid");
  res.status(response.statusCode).json(response);
});

// @desc    Reset password (after token is verified)
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest("Invalid or expired token");
  }

  // Hash the new password before saving
  user.password = await hashPassword(password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  const response = ApiResponse.success("Password reset successful");
  res.status(response.statusCode).json(response);
});
