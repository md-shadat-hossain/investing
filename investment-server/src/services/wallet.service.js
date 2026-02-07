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
 * Update totalWithdraw after withdrawal approval
 * @param {ObjectId} userId
 * @param {number} amount
 * @returns {Promise<Wallet>}
 */
const updateTotalWithdraw = async (userId, amount) => {
  const wallet = await getWalletByUserId(userId);
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
 * Get wallet statistics with charts data
 * @param {ObjectId} userId
 * @param {string} timeRange - '7d', '30d', '90d', '1y'
 * @returns {Promise<Object>}
 */
const getWalletStats = async (userId, timeRange = '30d') => {
  const { Transaction } = require("../models");
  const wallet = await getWalletByUserId(userId);

  // Calculate date range
  const now = new Date();
  let startDate;
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case '90d':
      startDate = new Date(now.setDate(now.getDate() - 90));
      break;
    case '1y':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default: // 30d
      startDate = new Date(now.setDate(now.getDate() - 30));
  }

  // Get all completed transactions in range
  const transactions = await Transaction.find({
    user: userId,
    status: 'completed',
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 });

  // Balance Trend - daily balance aggregation
  const balanceTrend = [];
  let runningBalance = wallet.balance;

  // Calculate initial balance (subtract recent transactions from current balance)
  transactions.slice().reverse().forEach(tx => {
    if (['deposit', 'profit', 'referral', 'bonus'].includes(tx.type)) {
      runningBalance -= tx.netAmount;
    } else if (['withdraw', 'investment'].includes(tx.type)) {
      runningBalance += tx.netAmount;
    }
  });

  // Build balance trend
  const dayGroups = {};
  transactions.forEach(tx => {
    const date = tx.createdAt.toISOString().split('T')[0];
    if (!dayGroups[date]) {
      dayGroups[date] = [];
    }
    dayGroups[date].push(tx);
  });

  Object.keys(dayGroups).sort().forEach(date => {
    dayGroups[date].forEach(tx => {
      if (['deposit', 'profit', 'referral', 'bonus'].includes(tx.type)) {
        runningBalance += tx.netAmount;
      } else if (['withdraw', 'investment'].includes(tx.type)) {
        runningBalance -= tx.netAmount;
      }
    });
    balanceTrend.push({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      balance: Math.round(runningBalance * 100) / 100
    });
  });

  // Income vs Expense - last 4 months
  const monthlyData = {};
  const last4Months = new Date();
  last4Months.setMonth(last4Months.getMonth() - 4);

  const allTransactions = await Transaction.find({
    user: userId,
    status: 'completed',
    createdAt: { $gte: last4Months }
  });

  allTransactions.forEach(tx => {
    const month = tx.createdAt.toLocaleDateString('en-US', { month: 'short' });
    if (!monthlyData[month]) {
      monthlyData[month] = { month, income: 0, expense: 0 };
    }

    if (['deposit', 'profit', 'referral', 'bonus'].includes(tx.type)) {
      monthlyData[month].income += tx.netAmount;
    } else if (['withdraw', 'investment'].includes(tx.type)) {
      monthlyData[month].expense += tx.netAmount;
    }
  });

  const incomeExpense = Object.values(monthlyData).map(m => ({
    month: m.month,
    income: Math.round(m.income * 100) / 100,
    expense: Math.round(m.expense * 100) / 100
  }));

  // Transaction Distribution
  const distribution = {
    deposit: 0,
    withdraw: 0,
    profit: 0,
    referral: 0,
    investment: 0,
    bonus: 0
  };

  allTransactions.forEach(tx => {
    if (distribution.hasOwnProperty(tx.type)) {
      distribution[tx.type]++;
    }
  });

  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0) || 1;
  const transactionDistribution = [
    { name: 'Deposits', value: Math.round((distribution.deposit / total) * 100), color: '#10B981' },
    { name: 'Withdrawals', value: Math.round((distribution.withdraw / total) * 100), color: '#EF4444' },
    { name: 'Profits', value: Math.round((distribution.profit / total) * 100), color: '#3B82F6' },
    { name: 'Commissions', value: Math.round((distribution.referral / total) * 100), color: '#F59E0B' },
  ];

  // Income Breakdown
  const incomeBreakdown = [
    {
      category: 'Deposits',
      amount: wallet.totalDeposit,
      percentage: wallet.totalDeposit + wallet.totalProfit + wallet.referralEarnings > 0
        ? Math.round((wallet.totalDeposit / (wallet.totalDeposit + wallet.totalProfit + wallet.referralEarnings)) * 100)
        : 0
    },
    {
      category: 'Profit Earned',
      amount: wallet.totalProfit,
      percentage: wallet.totalDeposit + wallet.totalProfit + wallet.referralEarnings > 0
        ? Math.round((wallet.totalProfit / (wallet.totalDeposit + wallet.totalProfit + wallet.referralEarnings)) * 100)
        : 0
    },
    {
      category: 'Referral Commissions',
      amount: wallet.referralEarnings,
      percentage: wallet.totalDeposit + wallet.totalProfit + wallet.referralEarnings > 0
        ? Math.round((wallet.referralEarnings / (wallet.totalDeposit + wallet.totalProfit + wallet.referralEarnings)) * 100)
        : 0
    },
  ];

  return {
    // Basic stats
    balance: wallet.balance,
    totalDeposit: wallet.totalDeposit,
    totalWithdraw: wallet.totalWithdraw,
    totalProfit: wallet.totalProfit,
    totalInvested: wallet.totalInvested,
    referralEarnings: wallet.referralEarnings,

    // Chart data
    balanceTrend,
    incomeExpense,
    transactionDistribution,
    incomeBreakdown,
  };
};

module.exports = {
  createWallet,
  getWalletByUserId,
  updateBalance,
  addDeposit,
  processWithdrawal,
  updateTotalWithdraw,
  addProfit,
  deductInvestment,
  addReferralEarnings,
  getWalletStats,
};
