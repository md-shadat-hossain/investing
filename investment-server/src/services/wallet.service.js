const httpStatus = require("http-status");
const { Wallet } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create wallet for user
 * @param {ObjectId} userId
 * @returns {Promise<Wallet>}
 */
const createWallet = async (userId) => {
  const existingWallet = await Wallet.findOne({ user: userId });
  if (existingWallet) {
    return existingWallet;
  }
  return Wallet.create({ user: userId });
};

/**
 * Get wallet by user ID
 * @param {ObjectId} userId
 * @returns {Promise<Wallet>}
 */
const getWalletByUserId = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await createWallet(userId);
  }
  return wallet;
};

/**
 * Update wallet balance
 * @param {ObjectId} userId
 * @param {number} amount
 * @param {string} type - 'add' or 'subtract'
 * @returns {Promise<Wallet>}
 */
const updateBalance = async (userId, amount, type = "add") => {
  const wallet = await getWalletByUserId(userId);

  if (type === "subtract" && wallet.balance < amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  if (type === "add") {
    wallet.balance += amount;
  } else {
    wallet.balance -= amount;
  }

  await wallet.save();
  return wallet;
};

/**
 * Add deposit to wallet
 * @param {ObjectId} userId
 * @param {number} amount
 * @returns {Promise<Wallet>}
 */
const addDeposit = async (userId, amount) => {
  const wallet = await getWalletByUserId(userId);
  wallet.balance += amount;
  wallet.totalDeposit += amount;
  await wallet.save();
  return wallet;
};

/**
 * Process withdrawal from wallet
 * @param {ObjectId} userId
 * @param {number} amount
 * @returns {Promise<Wallet>}
 */
const processWithdrawal = async (userId, amount) => {
  const wallet = await getWalletByUserId(userId);

  if (wallet.balance < amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  wallet.balance -= amount;
  wallet.totalWithdraw += amount;
  await wallet.save();
  return wallet;
};

/**
 * Add profit to wallet
 * @param {ObjectId} userId
 * @param {number} amount
 * @returns {Promise<Wallet>}
 */
const addProfit = async (userId, amount) => {
  const wallet = await getWalletByUserId(userId);
  wallet.balance += amount;
  wallet.totalProfit += amount;
  await wallet.save();
  return wallet;
};

/**
 * Deduct investment amount
 * @param {ObjectId} userId
 * @param {number} amount
 * @returns {Promise<Wallet>}
 */
const deductInvestment = async (userId, amount) => {
  const wallet = await getWalletByUserId(userId);

  if (wallet.balance < amount) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Insufficient balance");
  }

  wallet.balance -= amount;
  wallet.totalInvested += amount;
  await wallet.save();
  return wallet;
};

/**
 * Add referral earnings
 * @param {ObjectId} userId
 * @param {number} amount
 * @returns {Promise<Wallet>}
 */
const addReferralEarnings = async (userId, amount) => {
  const wallet = await getWalletByUserId(userId);
  wallet.balance += amount;
  wallet.referralEarnings += amount;
  await wallet.save();
  return wallet;
};

/**
 * Get wallet statistics
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getWalletStats = async (userId) => {
  const wallet = await getWalletByUserId(userId);
  return {
    balance: wallet.balance,
    totalDeposit: wallet.totalDeposit,
    totalWithdraw: wallet.totalWithdraw,
    totalProfit: wallet.totalProfit,
    totalInvested: wallet.totalInvested,
    referralEarnings: wallet.referralEarnings,
  };
};

module.exports = {
  createWallet,
  getWalletByUserId,
  updateBalance,
  addDeposit,
  processWithdrawal,
  addProfit,
  deductInvestment,
  addReferralEarnings,
  getWalletStats,
};
