const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    businessUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expertUserId: {
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
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      default: null,
    },
  },
  { timestamps: true }
);

conversationSchema.index({ businessUserId: 1, expertUserId: 1, requirementId: 1 }, { unique: true });
conversationSchema.index({ expertUserId: 1, updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
