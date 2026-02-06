const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createDeposit = {
  body: Joi.object().keys({
    amount: Joi.number().required().min(1),
    paymentMethod: Joi.string().valid("bitcoin", "ethereum", "usdt", "bank_transfer", "paypal", "stripe", "other"),
    paymentGatewayId: Joi.string().required().custom(objectId).messages({
      "any.required": "Payment gateway is required",
      "string.empty": "Payment gateway cannot be empty"
    }),
    walletAddress: Joi.string().allow("", null),
    txHash: Joi.string().required().messages({
      "any.required": "Transaction ID is required",
      "string.empty": "Transaction ID cannot be empty"
    }),
    proofImage: Joi.string().allow("", null),
  }),
};

const createWithdrawal = {
  body: Joi.object().keys({
    amount: Joi.number().required().min(1),
    paymentMethod: Joi.string().valid("bitcoin", "ethereum", "usdt", "bank_transfer", "paypal", "other"),
    paymentGatewayId: Joi.string().custom(objectId),
    walletAddress: Joi.string().allow("", null),
    bankDetails: Joi.object().keys({
      bankName: Joi.string().allow("", null),
      accountNumber: Joi.string().allow("", null),
      accountName: Joi.string().allow("", null),
      routingNumber: Joi.string().allow("", null),
      swiftCode: Joi.string().allow("", null),
    }),
  }),
};

const getMyTransactions = {
  query: Joi.object().keys({
    type: Joi.string().valid("deposit", "withdraw", "investment", "profit", "referral", "bonus"),
    status: Joi.string().valid("pending", "processing", "completed", "rejected", "cancelled"),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId),
  }),
};

const getAllTransactions = {
  query: Joi.object().keys({
    type: Joi.string().valid("deposit", "withdraw", "investment", "profit", "referral", "bonus"),
    status: Joi.string().valid("pending", "processing", "completed", "rejected", "cancelled"),
    user: Joi.string().custom(objectId),
    paymentMethod: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPendingTransactions = {
  query: Joi.object().keys({
    type: Joi.string().valid("deposit", "withdraw"),
  }),
};

const approveTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    adminNote: Joi.string().allow("", null),
  }),
};

const rejectTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reason: Joi.string().required(),
  }),
};

module.exports = {
  createDeposit,
  createWithdrawal,
  getMyTransactions,
  getTransaction,
  getAllTransactions,
  getPendingTransactions,
  approveTransaction,
  rejectTransaction,
};
