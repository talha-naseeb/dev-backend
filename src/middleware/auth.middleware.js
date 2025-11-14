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
    errors.push("Please provide a valid email address");
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
    const userId = req.user?.id;
    if (!userId) throw ApiError.unauthorized("User not authenticated");

    const user = await User.findById(userId);
    if (!user) throw ApiError.notFound("User not found");

    if (!user.isVerified) throw ApiError.forbidden("Please verify your email before accessing this resource");

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

    const user = await User.findById(decoded._id);
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
    // Relies on req.user being set by 'authenticate'
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    next();
  };
};
