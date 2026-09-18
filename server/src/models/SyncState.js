const mongoose = require("mongoose");

const syncStateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "inbound_email",
    },

    lastCheckedAt: {
      type: Date,
      default: null,
    },

    lastUid: {
      type: Number,
      default: 0,
    },

    processedUids: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

syncStateSchema.index({ key: 1 });

module.exports = mongoose.model("SyncState", syncStateSchema);
