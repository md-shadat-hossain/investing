const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const transactionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["deposit", "withdraw", "investment", "profit", "referral", "bonus", "fee"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "rejected", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["crypto", "ethereum", "bank", "payment_processor", "paypal", "stripe", "wallet", "other"],
      default: "wallet",
    },
    paymentGateway: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "PaymentGateway",
      default: null,
    },
    walletAddress: {
      type: String,
      default: null,
    },
    txHash: {
      type: String,
      default: null,
    },
    bankDetails: {
      bankName: { type: String, default: null },
      accountNumber: { type: String, default: null },
      accountName: { type: String, default: null },
      routingNumber: { type: String, default: null },
      swiftCode: { type: String, default: null },
    },
    transactionId: {
      type: String,
      unique: true,
    },
    reference: {
      type: mongoose.SchemaTypes.ObjectId,
      refPath: "referenceModel",
      default: null,
    },
    referenceModel: {
      type: String,
      enum: ["Investment", "Referral", "SupportTicket", null],
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    adminNote: {
      type: String,
      default: null,
    },
    processedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    proofImage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

// Generate unique transaction ID before saving
transactionSchema.pre("save", function (next) {
  if (!this.transactionId) {
    const prefix = this.type.toUpperCase().substring(0, 3);
    this.transactionId = `TXN-${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
