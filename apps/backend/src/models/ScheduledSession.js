const mongoose = require("mongoose");

const scheduledSessionSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Requirement",
      default: null,
      index: true,
    },
    companyName: { type: String, trim: true, required: true },
    sessionType: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "confirmed"],
      default: "pending",
      index: true,
    },
    scheduledDate: { type: Date, required: true },
    startTime: { type: String, trim: true, default: "" },
    endTime: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

scheduledSessionSchema.index({ expertId: 1, scheduledDate: 1 });

module.exports = mongoose.model("ScheduledSession", scheduledSessionSchema);
