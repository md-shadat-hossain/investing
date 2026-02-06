const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const investmentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "InvestmentPlan",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    expectedProfit: {
      type: Number,
      required: true,
      min: 0,
    },
    earnedProfit: {
      type: Number,
      default: 0,
      min: 0,
    },
    roi: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    nextProfitDate: {
      type: Date,
      default: null,
    },
    lastProfitDate: {
      type: Date,
      default: null,
    },
    totalProfitDistributions: {
      type: Number,
      default: 0,
      comment: "Number of times profit has been distributed",
    },
    dailyProfitAmount: {
      type: Number,
      default: 0,
      comment: "Calculated daily profit amount",
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "paused"],
      default: "active",
    },
    isPaused: {
      type: Boolean,
      default: false,
      comment: "Admin can pause profit distribution",
    },
    pausedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      default: null,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
    pauseReason: {
      type: String,
      default: null,
    },
    autoReinvest: {
      type: Boolean,
      default: false,
    },
    transactionId: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

investmentSchema.plugin(toJSON);
investmentSchema.plugin(paginate);

// Generate unique transaction ID before saving
investmentSchema.pre("save", function (next) {
  if (!this.transactionId) {
    this.transactionId = "INV-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

const Investment = mongoose.model("Investment", investmentSchema);

module.exports = Investment;
