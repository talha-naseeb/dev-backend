const mongoose = require("mongoose");

const breakSchema = new mongoose.Schema({
  breakIn: Date,
  breakOut: Date,
  durationMinutes: Number,
});

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true }, // store date-only (set at check-in)
    loginTime: Date,
    logoutTime: Date,
    breaks: [breakSchema],
    totalHours: Number,
    status: { type: String, enum: ["present", "absent", "half-day"], default: "present" },
  },
  { timestamps: true }
);

attendanceSchema.index({ user: 1, date: 1 }, { unique: true }); // Ensure one record per user per date

module.exports = mongoose.model("Attendance", attendanceSchema);
