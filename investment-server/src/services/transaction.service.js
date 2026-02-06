const httpStatus = require("http-status");
const { Transaction, PaymentGateway } = require("../models");
const ApiError = require("../utils/ApiError");
const walletService = require("./wallet.service");

/**
 * Create a deposit request
 * @param {ObjectId} userId
 * @param {Object} depositData
 * @returns {Promise<Transaction>}
 */
const createDeposit = async (userId, depositData) => {
  const { amount, paymentMethod, paymentGatewayId, walletAddress, txHash, proofImage } = depositData;

  let gateway = null;
  if (paymentGatewayId) {
    gateway = await PaymentGateway.findById(paymentGatewayId);
    if (!gateway) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment gateway not found");
    }
    if (!gateway.isActive || !gateway.isDepositEnabled) {
      throw new ApiError(httpStatus.BAD_REQUEST, "This payment method is not available for deposits");
    }
    if (amount < gateway.minDeposit || amount > gateway.maxDeposit) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Deposit amount must be between $${gateway.minDeposit} and $${gateway.maxDeposit}`
      );
    }
  }

  // Calculate fee
  let fee = 0;
  if (gateway) {
    fee = gateway.depositFeeType === "percentage"
      ? (amount * gateway.depositFee) / 100
      : gateway.depositFee;
  }

  const netAmount = amount - fee;

  const transaction = await Transaction.create({
    user: userId,
    type: "deposit",
    amount,
    fee,
    netAmount,
    status: "pending",
    paymentMethod: paymentMethod || (gateway ? gateway.type : "other"),
    paymentGateway: paymentGatewayId,
    walletAddress,
    txHash,
    proofImage,
    description: `Deposit via ${gateway ? gateway.name : paymentMethod}`,
  });

  return transaction;
};

/**
 * Create a withdrawal request
 * @param {ObjectId} userId
 * @param {Object} withdrawData
 * @returns {Promise<Transaction>}
 */
const createWithdrawal = async (userId, withdrawData) => {
  const { amount, paymentMethod, paymentGatewayId, walletAddress, bankDetails } = withdrawData;

  // Check wallet balance
  const wallet = await walletService.getWalletByUserId(userId);
  if (wallet.balance < amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  let gateway = null;
  if (paymentGatewayId) {
    gateway = await PaymentGateway.findById(paymentGatewayId);
    if (!gateway) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment gateway not found");
    }
    if (!gateway.isActive || !gateway.isWithdrawEnabled) {
      throw new ApiError(httpStatus.BAD_REQUEST, "This payment method is not available for withdrawals");
    }
    if (amount < gateway.minWithdraw || amount > gateway.maxWithdraw) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Withdrawal amount must be between $${gateway.minWithdraw} and $${gateway.maxWithdraw}`
      );
    }
  }

  // Calculate fee
  let fee = 0;
  if (gateway) {
    fee = gateway.withdrawFeeType === "percentage"
      ? (amount * gateway.withdrawFee) / 100
      : gateway.withdrawFee;
  }

  const netAmount = amount - fee;

  // Deduct from wallet (hold the amount)
  await walletService.updateBalance(userId, amount, "subtract");

  const transaction = await Transaction.create({
    user: userId,
    type: "withdraw",
    amount,
    fee,
    netAmount,
    status: "pending",
    paymentMethod: paymentMethod || (gateway ? gateway.type : "other"),
    paymentGateway: paymentGatewayId,
    walletAddress,
    bankDetails,
    description: `Withdrawal via ${gateway ? gateway.name : paymentMethod}`,
  });

  return transaction;
};

/**
 * Approve a transaction (admin)
 * @param {ObjectId} transactionId
 * @param {ObjectId} adminId
 * @param {string} adminNote
 * @returns {Promise<Transaction>}
 */
const approveTransaction = async (transactionId, adminId, adminNote = null) => {
  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  if (transaction.status !== "pending") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Transaction is not pending");
  }

  if (transaction.type === "deposit") {
    // Add to wallet
    await walletService.addDeposit(transaction.user, transaction.netAmount);
  }
  // For withdrawals, amount was already deducted when request was created

  transaction.status = "completed";
  transaction.processedBy = adminId;
  transaction.processedAt = new Date();
  transaction.adminNote = adminNote;
  await transaction.save();

  return transaction;
};

/**
 * Reject a transaction (admin)
 * @param {ObjectId} transactionId
 * @param {ObjectId} adminId
 * @param {string} reason
 * @returns {Promise<Transaction>}
 */
const rejectTransaction = async (transactionId, adminId, reason) => {
  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  if (transaction.status !== "pending") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Transaction is not pending");
  }

  if (transaction.type === "withdraw") {
    // Refund the amount back to wallet
    await walletService.updateBalance(transaction.user, transaction.amount, "add");
  }

  transaction.status = "rejected";
  transaction.processedBy = adminId;
  transaction.processedAt = new Date();
  transaction.adminNote = reason;
  await transaction.save();

  return transaction;
};

/**
 * Get transactions by user
 * @param {ObjectId} userId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getTransactionsByUser = async (userId, filter = {}, options = {}) => {
  return Transaction.paginate(
    { user: userId, ...filter },
    { ...options, populate: "paymentGateway", sort: { createdAt: -1 } }
  );
};

/**
 * Get transaction by id
 * @param {ObjectId} id
 * @returns {Promise<Transaction>}
 */
const getTransactionById = async (id) => {
  return Transaction.findById(id).populate("user paymentGateway processedBy");
};

/**
 * Query all transactions (admin)
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const queryTransactions = async (filter, options) => {
  return Transaction.paginate(filter, {
    ...options,
    populate: "user paymentGateway processedBy",
    sort: { createdAt: -1 }
  });
};

/**
 * Get pending transactions (admin)
 * @param {string} type - 'deposit' or 'withdraw'
 * @returns {Promise<Transaction[]>}
 */
const getPendingTransactions = async (type = null) => {
  const filter = { status: "pending" };
  if (type) filter.type = type;

  return Transaction.find(filter)
    .populate("user paymentGateway")
    .sort({ createdAt: -1 });
};

/**
 * Get transaction statistics
 * @param {ObjectId} userId - optional, for user-specific stats
 * @returns {Promise<Object>}
 */
const getTransactionStats = async (userId = null) => {
  const match = userId ? { user: userId } : {};

  const stats = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { type: "$type", status: "$status" },
        count: { $sum: 1 },
        totalAmount: { $sum: "$amount" },
      },
    },
  ]);

  return stats;
};

/**
 * Create internal transaction (profit, referral, bonus)
 * @param {ObjectId} userId
 * @param {Object} data
 * @returns {Promise<Transaction>}
 */
const createInternalTransaction = async (userId, data) => {
  const { type, amount, description, reference, referenceModel } = data;

  const transaction = await Transaction.create({
    user: userId,
    type,
    amount,
    fee: 0,
    netAmount: amount,
    status: "completed",
    paymentMethod: "wallet",
    description,
    reference,
    referenceModel,
  });

  return transaction;
};

module.exports = {
  createDeposit,
  createWithdrawal,
  approveTransaction,
  rejectTransaction,
  getTransactionsByUser,
  getTransactionById,
  queryTransactions,
  getPendingTransactions,
  getTransactionStats,
  createInternalTransaction,
};
