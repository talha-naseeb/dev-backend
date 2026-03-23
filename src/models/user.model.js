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
      enum: ["super_admin", "admin", "manager", "employee", "developer"],
      default: "developer",
    },
    // Multi-tenancy: Every non-admin user must belong to an Admin's workspace
    adminRef: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Billing & Limits (Only applicable if role is 'admin')
    maxUsersLimit: {
      type: Number,
      default: 3,
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },

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
    },

    resetPasswordToken: {
      type: String,
      index: true, // Add index for fast lookup
    },
    resetPasswordExpires: {
      type: Date,
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
