const ApiError = require("../utils/apiError.js");
const validator = require("validator");
const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

// 🔹 Basic Request Validation
exports.validateLoginAuth = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.includes("@")) {
    errors.push("Valid email is required");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (errors.length > 0) {
    throw ApiError.badRequest(errors);
  }

  next();
};

// signUp Validation
exports.validateSignUpAuth = (req, res, next) => {
  const { name, email, mobileNumber, password, role } = req.body;
  const errors = [];

  // Validate name
  if (!name || !validator.isLength(name, { min: 2, max: 50 })) {
    errors.push("Name must be between 2 and 50 characters");
  }

  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.push("Please provide a valid email address");
  }
  if (!mobileNumber || !validator.isMobilePhone(mobileNumber)) {
    errors.push("Please provide a valid mobile number");
  }

  // Validate password
  if (!password || !validator.isLength(password, { min: 6 })) {
    errors.push("Password must be at least 6 characters long");
  }

  // Validate role
  if (role && !["admin", "manager", "employee"].includes(role)) {
    errors.push("Invalid role specified");
  }

  // If there are validation errors, throw an ApiError
  if (errors.length > 0) {
    throw ApiError.badRequest(errors);
  }

  next();
};

// 🔹 Forgot Password Validation
exports.validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  // Validate email
  if (!email || !validator.isEmail(email)) {
    errors.push("Please provide a valid email address");
  }

  if (errors.length > 0) {
    throw ApiError.badRequest(errors);
  }

  next();
};

// 🔹 Reset Password Validation
exports.validateResetPassword = (req, res, next) => {
  const { token, password } = req.body;
  const errors = [];

  // Validate token
  if (!token || typeof token !== "string" || token.length < 10) {
    errors.push("Valid reset token is required");
  }

  // Validate password
  if (!password || !validator.isLength(password, { min: 6 })) {
    errors.push("Password must be at least 6 characters long");
  }

  if (errors.length > 0) {
    throw ApiError.badRequest(errors);
  }

  next();
};

// 🔹 Verify Reset Token Validation (only token)
exports.validateVerifyResetToken = (req, res, next) => {
  const { token } = req.body;
  const errors = [];

  // Validate token
  if (!token || typeof token !== "string" || token.length < 10) {
    errors.push("Valid reset token is required");
  }

  if (errors.length > 0) {
    throw ApiError.badRequest("Validation Error", errors);
  }

  next();
};

// Verify User Email Middleware
exports.validateUserEmail = async (req, res, next) => {
  try {
  
    if (!req.user || !req.user._id) throw ApiError.unauthorized("User not authenticated");

    const user = req.user.isVerified !== undefined ? req.user : await User.findById(req.user._id);
    if (!user) throw ApiError.notFound("User not found");

    if (!user.isVerified) throw ApiError.forbidden("Please verify your email before accessing this resource");

    if (user._id && String(user._id) === String(req.user._id)) req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

// 🔹 Authenticate Middleware
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw ApiError.unauthorized("No valid token provided");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Accept either decoded.id or decoded._id for backwards compatibility
    const userId = decoded?.id || decoded?._id || decoded?.userId;
    if (!userId) throw ApiError.unauthorized("Token payload invalid");

    const user = await User.findById(userId).select("-password");
    if (!user) throw ApiError.unauthorized("User not found");

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") return next(ApiError.unauthorized("Invalid token"));
    if (error.name === "TokenExpiredError") return next(ApiError.unauthorized("Token expired"));
    next(ApiError.unauthorized(error.message || "Authentication failed"));
  }
};

// 🔹 Role-based Authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // ensure authentication ran
    if (!req.user) return next(ApiError.unauthorized("Not authenticated"));

    // role must exist and be a string
    const role = req.user.role;
    if (!role || typeof role !== "string") {
      // Log for debugging (remove in prod or use logger)
      console.warn("Authorization check failed — missing role on user:", { userId: req.user._id, role });
      return next(ApiError.forbidden("Insufficient permissions"));
    }

    // final check
    if (!roles.includes(role)) {
      console.warn("Authorization denied — user role not allowed:", { userId: req.user._id, role, required: roles });
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }

    next();
  };
};
