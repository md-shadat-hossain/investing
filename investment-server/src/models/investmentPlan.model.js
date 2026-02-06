const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const investmentPlanSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    minDeposit: {
      type: Number,
      required: true,
      min: 0,
    },
    maxDeposit: {
      type: Number,
      required: true,
      min: 0,
    },
    roi: {
      type: Number,
      required: true,
      min: 0,
    },
    roiType: {
      type: String,
      enum: ["daily", "weekly", "monthly", "total"],
      default: "daily",
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    durationType: {
      type: String,
      enum: ["hours", "days", "weeks", "months"],
      default: "days",
    },
    referralBonus: {
      type: Number,
      default: 5,
      min: 0,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    features: [{
      type: String,
    }],
    totalInvestors: {
      type: Number,
      default: 0,
    },
    totalInvested: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

investmentPlanSchema.plugin(toJSON);
investmentPlanSchema.plugin(paginate);

const InvestmentPlan = mongoose.model("InvestmentPlan", investmentPlanSchema);

module.exports = InvestmentPlan;
