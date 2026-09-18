const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.pre("validate", function (next) {
  if (!this.leadId && !this.contactId) {
    next(new Error("Note must be associated with either a lead or a contact"));
  } else {
    next();
  }
});

noteSchema.index({ leadId: 1 });
noteSchema.index({ contactId: 1 });
noteSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Note", noteSchema);