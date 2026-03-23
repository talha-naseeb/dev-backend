const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/helpers/asyncHandler");
const crypto = require("crypto");
const { hashPassword } = require("../utils/helpers/authHelpers");
const { sendEmployeeCredentialsEmail } = require("../utils/email");
const validator = require("validator");

// Manager creates an employee (or Admin can use same endpoint)

exports.createEmployee = asyncHandler(async (req, res) => {
  // final server-side guard (double protection)
  if (!["admin", "manager"].includes(req.user.role)) {
    throw ApiError.forbidden("Only admin or manager can create employees");
  }

  const { name, email, department, contactNumber, companyEmail, jobDescription, role: requestedRole } = req.body;

  // Multi-tenancy context
  const isAdmin = req.user.role === "admin";
  const adminId = isAdmin ? req.user._id : req.user.adminRef;

  if (!adminId) {
    throw ApiError.forbidden("User is not associated with a valid workspace admin");
  }

  // Get Admin's current limit
  const workspaceAdmin = await User.findById(adminId);
  if (!workspaceAdmin) throw ApiError.notFound("Workspace admin not found");

  // Count existing employees/managers in this workspace
  const currentCount = await User.countDocuments({ adminRef: adminId });
  
  if (currentCount >= workspaceAdmin.maxUsersLimit) {
    throw ApiError.forbidden(`Limit reached: You have already created ${workspaceAdmin.maxUsersLimit} users. Please contact Super Admin to upgrade.`);
  }

  if (!validator.isEmail(email)) {
    throw ApiError.badRequest("Please provide a valid email address");
  }
  if (!name || !email) throw ApiError.badRequest("Name and email required");

  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict("Email already exists");

  // generate temporary password
  const temporaryPassword = crypto.randomBytes(6).toString("hex") + "Aa1!";
  const hashedPassword = await hashPassword(temporaryPassword);

  // verification token (send raw token to user, store hashed)
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  const verificationExpires = Date.now() + 1000 * 60 * 60; // 1 hour

  // managerId defaulting logic
  let managerId = req.body.managerId;
  if (!managerId && req.user.role === "manager") managerId = req.user._id;

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role: requestedRole || "developer", // Default to developer
    adminRef: adminId,
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

  // send combined email (credentials + verification link)
  await sendEmployeeCredentialsEmail(email, temporaryPassword, verificationToken);

  res.status(201).json(ApiResponse.created("Employee created and verification email sent", { userId: user._id }));
});

// Manager view their team
exports.getTeam = asyncHandler(async (req, res) => {
  // manager or admin
  const isAdmin = req.user.role === "admin";
  const adminId = isAdmin ? req.user._id : req.user.adminRef;

  if (!adminId) throw ApiError.forbidden("Workspace context missing");

  let query = { adminRef: adminId };
  if (req.user.role === "manager") {
    query.manager = req.user._id;
  }

  const team = await User.find(query)
    .select("name email role mobileNumber companyEmail department jobDescription manager status")
    .lean();

  res.status(200).json(ApiResponse.success("Team retrieved", { team }));
});

// Get single team member
exports.getEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user.role === "admin";
  const adminId = isAdmin ? req.user._id : req.user.adminRef;

  const user = await User.findById(id).select("name email role mobileNumber companyEmail department jobDescription manager createdAt updatedAt adminRef");
  if (!user) throw ApiError.notFound("User not found");

  // Ensure user belongs to this admin's workspace
  if (String(user.adminRef) !== String(adminId)) {
    throw ApiError.forbidden("Access denied: User belongs to a different workspace");
  }

  // if requester is manager, ensure they manage this user
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
