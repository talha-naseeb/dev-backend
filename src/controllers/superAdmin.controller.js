const User = require("../models/user.model");
const ApiResponse = require("../utils/apiResponse");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/helpers/asyncHandler");

// @desc    Get all Admin clients and their workspace statistics
// @route   GET /api/super-admin/clients
// @access  Super Admin
exports.getAllClients = asyncHandler(async (req, res) => {
  // Fetch all users who are workspace admins
  const admins = await User.find({ role: "admin" }).select("-password");
  
  // To get the count of employees per admin, we could run an aggregate.
  // For now we will return the admins, and optionally append the count.
  const clientsWithStats = await Promise.all(
    admins.map(async (admin) => {
      const employeeCount = await User.countDocuments({ adminRef: admin._id });
      return {
        ...admin.toObject(),
        activeEmployees: employeeCount,
      };
    })
  );

  const response = ApiResponse.success("Clients fetched successfully", { clients: clientsWithStats });
  res.status(response.statusCode).json(response);
});

// @desc    Update a client's max users limit or subscription tier
// @route   PUT /api/super-admin/clients/:id/tier
// @access  Super Admin
exports.updateClientTier = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { maxUsersLimit, subscriptionTier } = req.body;

  const client = await User.findById(id);

  if (!client) {
    throw ApiError.notFound("Client not found");
  }

  if (client.role !== "admin") {
    throw ApiError.badRequest("Selected user is not a Workspace Admin");
  }

  if (maxUsersLimit !== undefined) client.maxUsersLimit = maxUsersLimit;
  if (subscriptionTier !== undefined) client.subscriptionTier = subscriptionTier;

  await client.save();

  const response = ApiResponse.success("Client tier updated successfully", { client });
  res.status(response.statusCode).json(response);
});
