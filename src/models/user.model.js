const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    mobileNumber: String,
    personalEmail: String,
    department: {
      type: String,
      enum: ["Developer", "Designer", "Human Resource", "Quality Assurance", "Project Manager", "Sales", "Marketing"],
    },
    jobDescription: String,
    companyName: String,
    profileImage: String,
    companyLogo: String,

    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      index: true,
    },
    emailVerificationExpires: {
      type: Date,
      index: true,
    },

    resetPasswordToken: {
      type: String,
      index: true, // Add index for fast lookup
    },
    resetPasswordExpires: {
      type: Date,
      index: true, // Add index for expiration checks
    },

    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index for reset password queries
userSchema.index({ resetPasswordToken: 1, resetPasswordExpires: 1 });

// TTL Index: Auto-delete reset tokens after expiration
userSchema.index(
  { resetPasswordExpires: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { resetPasswordToken: { $exists: true } },
  }
);

// TTL Index: Auto-delete verification tokens after expiration
userSchema.index(
  { emailVerificationExpires: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { emailVerificationToken: { $exists: true } },
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
