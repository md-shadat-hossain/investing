const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const profitDistributionSchema = mongoose.Schema(
  {
    investment: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Investment",
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    originalRate: {
      type: Number,
      required: true,
      comment: "Original daily ROI percentage from plan",
    },
    appliedRate: {
      type: Number,
      required: true,
      comment: "Actual rate applied (may be adjusted by admin)",
    },
    adjustedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      default: null,
      comment: "Admin who adjusted the rate",
    },
    adjustmentReason: {
      type: String,
      default: null,
    },
    distributionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "completed",
    },
    transactionId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

profitDistributionSchema.plugin(toJSON);
profitDistributionSchema.plugin(paginate);

// Index for efficient queries
profitDistributionSchema.index({ investment: 1, distributionDate: 1 });
profitDistributionSchema.index({ user: 1, distributionDate: -1 });
profitDistributionSchema.index({ status: 1, distributionDate: 1 });

const ProfitDistribution = mongoose.model("ProfitDistribution", profitDistributionSchema);

module.exports = ProfitDistribution;
