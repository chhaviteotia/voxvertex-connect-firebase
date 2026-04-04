const mongoose = require("mongoose");
const { USER_TYPES } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(USER_TYPES),
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    companyName: { type: String, trim: true, default: "" },
    contactName: { type: String, trim: true, default: "" },
    organizationType: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    companySize: { type: String, trim: true, default: "" },
    annualBudgetBand: { type: String, trim: true, default: "" },
    operatingRegion: { type: String, trim: true, default: "" },
    decisionMakerRole: { type: String, trim: true, default: "" },
    decisionMakerSeniority: { type: String, trim: true, default: "" },
    expertEngagementsPerYear: { type: String, trim: true, default: "" },
    averageBudgetPerEngagement: { type: String, trim: true, default: "" },
    typicalEventTypes: [{ type: String, trim: true }],
    typicalAudienceRole: { type: String, trim: true, default: "" },
    audienceSeniority: { type: String, trim: true, default: "" },
    audienceKnowledgeLevel: { type: Number, default: 3 },
    preferredSessionDuration: { type: String, trim: true, default: "" },
    preferredDeliveryMode: { type: String, trim: true, default: "" },
    typicalOutcomes: [{ type: String, trim: true }],
    interactivityPreference: { type: Number, default: 3 },
    riskSensitivity: { type: String, trim: true, default: "Medium" },
    experimentalOpenness: { type: Number, default: 3 },
    outcomeMeasurementPreference: { type: String, trim: true, default: "" },
    name: { type: String, trim: true, default: "" },
    expertise: { type: String, trim: true, default: "" },
    experienceRange: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    message: { type: String, trim: true, default: "" },
    preferredRegions: [{ type: String, trim: true }],
    website: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    jobTitle: { type: String, trim: true, default: "" },
    notifExpertMatches: { type: Boolean, default: true },
    notifProposals: { type: Boolean, default: true },
    notifMessages: { type: Boolean, default: true },
    notifWeeklyDigest: { type: Boolean, default: false },
    avatarUrl: { type: String, trim: true, default: "" },
    /** Expert profile (Identity, Capability, Experience, Delivery, Pricing, Availability). Only for type=expert. */
    expertProfile: { type: mongoose.Schema.Types.Mixed, default: {} },
    passwordResetTokenHash: { type: String, select: false, default: "" },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, type: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
