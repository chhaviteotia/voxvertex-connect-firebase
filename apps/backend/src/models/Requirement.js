const mongoose = require("mongoose");

const requirementSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },
    /** Full form payload from Create Requirement (steps 1–6). */
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

requirementSchema.index({ createdBy: 1, createdAt: -1 });
requirementSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Requirement", requirementSchema);
