const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // manager/admin
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // employees
    status: {
      type: String,
      enum: ["pending", "in-progress", "in-review", "completed", "qa-approved", "qa-rejected"],
      default: "pending",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    startDate: Date,
    dueDate: Date,
    completedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // QA
    remarks: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
