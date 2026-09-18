const mongoose = require("mongoose");

const scheduledActivitySchema = new mongoose.Schema(
  {
    relatedLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    relatedContact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    type: {
      type: String,
      enum: ["CALL", "MEETING"],
      required: true,
    },

    scheduledFor: {
      type: Date,
      required: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

scheduledActivitySchema.pre("validate", function (next) {
  if (!this.relatedLead && !this.relatedContact) {
    next(
      new Error(
        "Scheduled activity must be linked to either a lead or a contact"
      )
    );
  } else {
    next();
  }
});

scheduledActivitySchema.index({ scheduledFor: 1 });
scheduledActivitySchema.index({ relatedLead: 1 });
scheduledActivitySchema.index({ relatedContact: 1 });
scheduledActivitySchema.index({ completed: 1 });

module.exports = mongoose.model(
  "ScheduledActivity",
  scheduledActivitySchema
);
