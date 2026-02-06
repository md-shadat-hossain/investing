const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const referralSchema = mongoose.Schema(
  {
    referrer: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    referred: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    referralCode: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 7,
      required: true,
    },
    commissionRate: {
      type: Number,
      default: 8,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "active", "inactive"],
      default: "pending",
    },
    firstDepositAmount: {
      type: Number,
      default: 0,
    },
    firstDepositDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.plugin(toJSON);
referralSchema.plugin(paginate);

// Ensure unique referrer-referred pair
referralSchema.index({ referrer: 1, referred: 1 }, { unique: true });

const Referral = mongoose.model("Referral", referralSchema);

module.exports = Referral;
