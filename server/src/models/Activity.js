const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      required: true,
    },

    action: {
      type: String,
      required: true,
      trim: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "STATUS_CHANGE",
        "NOTE_ADDED",
        "EMAIL_SENT",
        "ASSIGNED",
        "LEAD_CREATED",
        "LEAD_DELETED",
      ],
      default: "STATUS_CHANGE",
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);