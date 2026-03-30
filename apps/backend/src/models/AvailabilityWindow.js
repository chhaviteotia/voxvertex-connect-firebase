const mongoose = require("mongoose");

const availabilityWindowSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

availabilityWindowSchema.index({ expertId: 1, startDate: 1 });

module.exports = mongoose.model("AvailabilityWindow", availabilityWindowSchema);
