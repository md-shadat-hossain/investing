const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const walletSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalWithdraw: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: 0,
    },
    referralEarnings: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  {
    timestamps: true,
  }
);

walletSchema.plugin(toJSON);
walletSchema.plugin(paginate);

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
