const Activity = require("../models/activity.model");

const logActivity = async ({ type, message, userId, adminRef, metadata = {} }) => {
  try {
    await Activity.create({
      type,
      message,
      user: userId,
      adminRef,
      metadata,
    });
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};

module.exports = { logActivity };
