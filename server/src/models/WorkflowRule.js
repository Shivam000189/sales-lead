const mongoose = require("mongoose");

const workflowRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    triggerStatus: {
      type: String,
      enum: ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "WON", "LOST"],
      required: true,
    },
    action: {
      type: String,
      enum: ["SEND_EMAIL"],
      default: "SEND_EMAIL",
    },
    emailTemplateKey: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
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

workflowRuleSchema.index({ triggerStatus: 1, isActive: 1 });

module.exports = mongoose.model("WorkflowRule", workflowRuleSchema);
