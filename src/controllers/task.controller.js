const Task = require("../models/task.model");
const User = require("../models/user.model");
const ApiError = require("../utils/apiError");
const ApiResponse = require("../utils/apiResponse");
const asyncHandler = require("../utils/helpers/asyncHandler");

// Create a task (manager/admin)
exports.createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, startDate, dueDate, priority } = req.body;
  
  if (!title || !assignedTo || (Array.isArray(assignedTo) && assignedTo.length === 0)) {
    throw ApiError.badRequest("Title and assignedTo are required");
  }

  // ensure assignedTo users exist and (if requester is manager) they are in manager's team
  const assignees = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

  // If manager, ensure assignees are under same manager
  if (req.user.role === "manager") {
    const invalid = await User.findOne({ _id: { $in: assignees }, manager: { $ne: req.user._id } });
    if (invalid) throw ApiError.forbidden("You can only assign tasks to your team members");
  }

  const task = await Task.create({
    title,
    description,
    assignedBy: req.user._id,
    assignedTo: assignees,
    startDate,
    dueDate,
    priority,
  });

  res.status(201).json(ApiResponse.created("Task created", { task }));
});

// Get tasks (filter by role)
exports.getTasks = asyncHandler(async (req, res) => {
  const q = req.query || {};
  const filter = {};

  // Employees: tasks assigned to them
  if (req.user.role === "employee" || req.user.role === "developer" || req.user.role === "designer") {
    filter.assignedTo = req.user._id;
  }

  // Manager: tasks assigned by them OR assigned to their team (optional query)
  if (req.user.role === "manager") {
    // allow ?mine=true to get only tasks assignedBy this manager
    if (q.mine === "true") {
      filter.assignedBy = req.user._id;
    } else {
      // tasks assigned to manager's team OR created by manager
      const team = await User.find({ manager: req.user._id }).select("_id");
      const teamIds = team.map((t) => t._id);
      filter.$or = [{ assignedBy: req.user._id }, { assignedTo: { $in: teamIds } }];
    }
  }

  // QA and Admin: can see all tasks (admin can use query filters)
  if (req.user.role === "admin" || req.user.role === "qualityAssurance") {
    // optional filters: status, priority, assignedTo
    if (q.status) filter.status = q.status;
    if (q.priority) filter.priority = q.priority;
    if (q.assignedTo) filter.assignedTo = q.assignedTo;
  }

  const tasks = await Task.find(filter).populate("assignedBy", "name email role").populate("assignedTo", "name email role").populate("reviewedBy", "name email role").sort({ createdAt: -1 });

  res.status(200).json(ApiResponse.success("Tasks retrieved", { tasks }));
});

// Update task fields (title, description, dueDate, assignedTo, status, remarks)
exports.updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound("Task not found");

  // Permission checks:
  // - Employees can update only status or remarks if they are assigned
  if (req.user.role === "employee" || req.user.role === "developer" || req.user.role === "designer") {
    if (!task.assignedTo.map(String).includes(String(req.user._id))) {
      throw ApiError.forbidden("You are not assigned to this task");
    }
    // allow only limited updates
    const allowed = ["status", "remarks"];
    const dirty = Object.keys(updates).filter((k) => !allowed.includes(k));
    if (dirty.length) throw ApiError.forbidden("Employees can only update status or remarks");
  }

  // - Manager can edit if they are the creator or manager of assignees (handled earlier for create)
  if (req.user.role === "manager") {
    if (String(task.assignedBy) !== String(req.user._id)) {
      // allow manager to update tasks if they manage the assignees
      // ensure all new assignees are under manager
      if (updates.assignedTo) {
        const newAssignees = Array.isArray(updates.assignedTo) ? updates.assignedTo : [updates.assignedTo];
        const invalid = await User.findOne({ _id: { $in: newAssignees }, manager: { $ne: req.user._id } });
        if (invalid) throw ApiError.forbidden("You can only assign tasks to your team members");
      }
    }
  }

  // QA: can set status to qa-approved/qa-rejected
  if (req.user.role === "qualityAssurance") {
    if (updates.status && !["qa-approved", "qa-rejected"].includes(updates.status)) {
      throw ApiError.forbidden("QA can only change status to qa-approved or qa-rejected");
    }
    if (updates.status) task.reviewedBy = req.user._id;
  }

  // apply updates
  Object.assign(task, updates);
  if (updates.status === "completed") task.completedAt = new Date();
  await task.save();

  const populated = await Task.findById(task._id).populate("assignedBy", "name email").populate("assignedTo", "name email").populate("reviewedBy", "name email");

  res.status(200).json(ApiResponse.success("Task updated", { task: populated }));
});

// Get single task
exports.getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id).populate("assignedBy", "name email").populate("assignedTo", "name email").populate("reviewedBy", "name email");
  if (!task) throw ApiError.notFound("Task not found");
  res.status(200).json(ApiResponse.success("Task retrieved", { task }));
});
