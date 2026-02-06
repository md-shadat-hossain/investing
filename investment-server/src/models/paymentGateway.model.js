const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const paymentGatewaySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["crypto", "bank", "payment_processor"],
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      default: null,
    },
    walletAddress: {
      type: String,
      default: null,
    },
    qrCode: {
      type: String,
      default: null,
    },
    bankDetails: {
      bankName: { type: String, default: null },
      accountNumber: { type: String, default: null },
      accountName: { type: String, default: null },
      routingNumber: { type: String, default: null },
      swiftCode: { type: String, default: null },
      iban: { type: String, default: null },
    },
    minDeposit: {
      type: Number,
      default: 10,
    },
    maxDeposit: {
      type: Number,
      default: 100000,
    },
    minWithdraw: {
      type: Number,
      default: 10,
    },
    maxWithdraw: {
      type: Number,
      default: 50000,
    },
    depositFee: {
      type: Number,
      default: 0,
    },
    depositFeeType: {
      type: String,
      enum: ["fixed", "percentage"],
      default: "percentage",
    },
    withdrawFee: {
      type: Number,
      default: 0,
    },
    withdrawFeeType: {
      type: String,
      enum: ["fixed", "percentage"],
      default: "percentage",
    },
    processingTime: {
      type: String,
      default: "1-24 hours",
    },
    instructions: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDepositEnabled: {
      type: Boolean,
      default: true,
    },
    isWithdrawEnabled: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

paymentGatewaySchema.plugin(toJSON);
paymentGatewaySchema.plugin(paginate);

const PaymentGateway = mongoose.model("PaymentGateway", paymentGatewaySchema);

module.exports = PaymentGateway;
