// src/controllers/manager.controller.js
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/helpers/asyncHandler");
const crypto = require("crypto");
const { hashPassword } = require("../utils/helpers/authHelpers");
const { sendEmployeeCredentialsEmail } = require("../utils/email");

// Manager creates an employee (or Admin can use same endpoint)
exports.createEmployee = asyncHandler(async (req, res) => {
  const { name, email, department, contactNumber, companyEmail, jobDescription } = req.body;
  if (!name || !email) throw ApiError.badRequest("Name and email required");

  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("Email already exists");

  // Hash the password
  
  const passwordForEmployees = crypto.randomBytes(6).toString("hex");
  const hashedPassword = await hashPassword(passwordForEmployees);

  // Create email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

  const verificationExpires = Date.now() + 1000 * 60 * 60; 


  // managerId: manager creates => req.user._id (unless admin specifying managerId)
  let managerId = req.body.managerId;
  if (!managerId) managerId = req.user.role === "manager" ? req.user._id : undefined;


  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: "employee",
    manager: managerId,
    companyEmail: companyEmail || email,
    mobileNumber: contactNumber,
    department,
    jobDescription,
    isVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationExpires: verificationExpires,
  });

  await user.save();
  
  // email credentials
  await sendEmployeeCredentialsEmail(email, passwordForEmployees, verificationToken);

  res.status(201).json(ApiResponse.created("Employee created and need to verify now"));
});

// Manager view their team
exports.getTeam = asyncHandler(async (req, res) => {
  // manager or admin
  let team;
  if (req.user.role === "manager") {
    team = await User.find({ manager: req.user._id }).select("-password");
  } else if (req.user.role === "admin") {
    team = await User.find().select("-password");
  } else {
    throw ApiError.forbidden("Only managers or admins can view team");
  }
  res.status(200).json(ApiResponse.success("Team retrieved", { team }));
});

// Get single team member
exports.getEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password");
  if (!user) throw ApiError.notFound("User not found");

  // if requester is manager, ensure ownership
  if (req.user.role === "manager" && String(user.manager) !== String(req.user._id)) {
    throw ApiError.forbidden("Not your team member");
  }

  res.status(200).json(ApiResponse.success("Employee retrieved", { user }));
});

// Manager update employee (limited fields)
exports.updateEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowed = ["name", "mobileNumber", "companyEmail", "personalEmail", "department", "jobDescription", "role"];
  const updates = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined && req.body[f] !== null && req.body[f] !== "") updates[f] = req.body[f];
  });

  const employee = await User.findById(id);
  if (!employee) throw ApiError.notFound("User not found");

  // manager can update only their employees
  if (req.user.role === "manager" && String(employee.manager) !== String(req.user._id)) {
    throw ApiError.forbidden("Not your team member");
  }

  Object.assign(employee, updates);
  await employee.save();

  res.status(200).json(ApiResponse.success("Employee updated", { user: employee }));
});

// Manager remove employee (soft delete recommended — here we perform hard delete for brevity)
exports.deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const employee = await User.findById(id);
  if (!employee) throw ApiError.notFound("User not found");

  if (req.user.role === "manager" && String(employee.manager) !== String(req.user._id)) {
    throw ApiError.forbidden("Not your team member");
  }

  await User.deleteOne({ _id: id });
  res.status(200).json(ApiResponse.success("Employee deleted"));
});
