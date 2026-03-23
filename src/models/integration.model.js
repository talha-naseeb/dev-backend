const mongoose = require("mongoose");

const integrationSchema = new mongoose.Schema(
  {
    adminRef: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["slack", "teams", "github", "google_calendar"],
      required: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
    config: {
      webhookUrl: String,
      channelId: String,
      channelName: String,
      repository: String,
      calendarId: String,
    },
    credentials: {
      accessToken: String,
      refreshToken: String,
      expiry: Date,
    },
    lastSyncedAt: Date,
  },
  { timestamps: true }
);

// One integration type per workspace
integrationSchema.index({ adminRef: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("Integration", integrationSchema);
