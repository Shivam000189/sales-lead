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
      required: false,
      default: null,
    },

    type: {
      type: String,
      enum: [
        "STATUS_CHANGE",
        "NOTE_ADDED",
        "EMAIL_SENT",
        "EMAIL_RECEIVED",
        "ASSIGNED",
        "LEAD_CREATED",
        "LEAD_DELETED",
        "WORKFLOW_TRIGGERED",
      ],
      default: "STATUS_CHANGE",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);