const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

/**
 * Admin can set custom profit rates for specific:
 * - Users (all investments)
 * - Investments (specific investment)
 * - Plans (all investments in a plan)
 * - Date ranges
 */
const profitAdjustmentSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["global", "user", "investment", "plan"],
      required: true,
    },
    targetUser: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      default: null,
    },
    targetInvestment: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Investment",
      default: null,
    },
    targetPlan: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "InvestmentPlan",
      default: null,
    },
    adjustmentType: {
      type: String,
      enum: ["percentage", "fixed_amount", "multiplier"],
      required: true,
    },
    adjustmentValue: {
      type: Number,
      required: true,
      comment: "Percentage (e.g., 5), Fixed amount (e.g., 100), or Multiplier (e.g., 1.5)",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
      comment: "null = indefinite",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
      comment: "Higher priority adjustments are applied first",
    },
    reason: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

profitAdjustmentSchema.plugin(toJSON);
profitAdjustmentSchema.plugin(paginate);

// Index for efficient queries
profitAdjustmentSchema.index({ type: 1, isActive: 1 });
profitAdjustmentSchema.index({ targetUser: 1, isActive: 1 });
profitAdjustmentSchema.index({ targetInvestment: 1, isActive: 1 });
profitAdjustmentSchema.index({ startDate: 1, endDate: 1 });

const ProfitAdjustment = mongoose.model("ProfitAdjustment", profitAdjustmentSchema);

module.exports = ProfitAdjustment;
