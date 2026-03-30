const Activity = require("../models/activity.model");

const logActivity = async ({ type, message, userId, adminRef, metadata = {}, io }) => {
  try {
    const activity = await Activity.create({
      type,
      message,
      user: userId,
      adminRef,
      metadata,
    });

    // Emit real-time activity to the admin's workspace room
    if (io && adminRef) {
      const populated = await activity.populate("user", "name role");
      io.to(adminRef.toString()).emit("activity:new", populated);
    }
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};

module.exports = { logActivity };

