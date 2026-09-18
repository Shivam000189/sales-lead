const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "NEW",
        "CONTACTED",
        "QUALIFIED",
        "PROPOSAL_SENT",
        "WON",
        "LOST",
      ],
      default: "NEW",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: 1 });
leadSchema.index({ assignedTo: 1 });

module.exports = mongoose.model("Lead", leadSchema);
