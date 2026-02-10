const httpStatus = require("http-status");
const { Investment, InvestmentPlan } = require("../models");
const ApiError = require("../utils/ApiError");
const walletService = require("./wallet.service");
const investmentPlanService = require("./investmentPlan.service");

/**
 * Calculate end date based on plan duration
 * @param {Object} plan
 * @returns {Date}
 */
const calculateEndDate = (plan) => {
  const now = new Date();
  switch (plan.durationType) {
    case "minutes":
      return new Date(now.getTime() + plan.duration * 60 * 1000);
    case "hours":
      return new Date(now.getTime() + plan.duration * 60 * 60 * 1000);
    case "days":
      return new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);
    case "weeks":
      return new Date(now.getTime() + plan.duration * 7 * 24 * 60 * 60 * 1000);
    case "months":
      return new Date(now.setMonth(now.getMonth() + plan.duration));
    default:
      return new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);
  }
};

/**
 * Convert plan duration to total minutes
 * @param {Object} plan
 * @returns {number}
 */
const getDurationInMinutes = (plan) => {
  switch (plan.durationType) {
    case "minutes":
      return plan.duration;
    case "hours":
      return plan.duration * 60;
    case "days":
      return plan.duration * 24 * 60;
    case "weeks":
      return plan.duration * 7 * 24 * 60;
    case "months":
      return plan.duration * 30 * 24 * 60;
    default:
      return plan.duration * 24 * 60;
  }
};

/**
 * Get the profit interval in milliseconds based on ROI type
 * @param {string} roiType
 * @returns {number} interval in ms
 */
const getProfitIntervalMs = (roiType) => {
  switch (roiType) {
    case "hourly":
      return 60 * 60 * 1000; // 1 hour
    case "daily":
      return 24 * 60 * 60 * 1000; // 1 day
    case "weekly":
      return 7 * 24 * 60 * 60 * 1000; // 1 week
    case "monthly":
      return 30 * 24 * 60 * 60 * 1000; // 30 days
    case "total":
      return 24 * 60 * 60 * 1000; // distribute daily for total
    default:
      return 24 * 60 * 60 * 1000;
  }
};

/**
 * Calculate expected profit
 * @param {number} amount
 * @param {Object} plan
 * @returns {number}
 */
const calculateExpectedProfit = (amount, plan) => {
  const roiPercentage = plan.roi / 100;
  const totalMinutes = getDurationInMinutes(plan);

  switch (plan.roiType) {
    case "hourly": {
      const totalHours = totalMinutes / 60;
      return amount * roiPercentage * totalHours;
    }
    case "daily": {
      const totalDays = totalMinutes / (24 * 60);
      return amount * roiPercentage * totalDays;
    }
    case "weekly": {
      const totalWeeks = totalMinutes / (7 * 24 * 60);
      return amount * roiPercentage * totalWeeks;
    }
    case "monthly": {
      const totalMonths = totalMinutes / (30 * 24 * 60);
      return amount * roiPercentage * totalMonths;
    }
    case "total":
      return amount * roiPercentage;
    default:
      return amount * roiPercentage * plan.duration;
  }
};

/**
 * Create an investment
 * @param {ObjectId} userId
 * @param {ObjectId} planId
 * @param {number} amount
 * @returns {Promise<Investment>}
 */
const createInvestment = async (userId, planId, amount) => {
  const plan = await investmentPlanService.getPlanById(planId);

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Investment plan not found");
  }

  if (!plan.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, "This plan is not available");
  }

  if (amount < plan.minDeposit || amount > plan.maxDeposit) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Investment amount must be between $${plan.minDeposit} and $${plan.maxDeposit}`
    );
  }

  // Deduct from wallet
  await walletService.deductInvestment(userId, amount);

  // Update plan statistics
  await investmentPlanService.incrementPlanStats(planId, amount);

  const expectedProfit = calculateExpectedProfit(amount, plan);
  const endDate = calculateEndDate(plan);

  // Calculate per-interval profit amount (stored as dailyProfitAmount for display)
  let dailyProfitAmount = 0;
  if (plan.roiType === "hourly") {
    dailyProfitAmount = (amount * plan.roi) / 100;
  } else if (plan.roiType === "daily") {
    dailyProfitAmount = (amount * plan.roi) / 100;
  } else if (plan.roiType === "total") {
    const totalMinutes = getDurationInMinutes(plan);
    const totalDays = totalMinutes / (24 * 60);
    dailyProfitAmount = (amount * plan.roi) / 100 / (totalDays || 1);
  } else if (plan.roiType === "monthly") {
    dailyProfitAmount = (amount * plan.roi) / 100 / 30;
  } else if (plan.roiType === "weekly") {
    dailyProfitAmount = (amount * plan.roi) / 100 / 7;
  }

  // Set next profit date based on ROI interval
  const nextProfitDate = new Date();
  const intervalMs = getProfitIntervalMs(plan.roiType);
  nextProfitDate.setTime(nextProfitDate.getTime() + intervalMs);

  const investment = await Investment.create({
    user: userId,
    plan: planId,
    amount,
    expectedProfit,
    roi: plan.roi,
    endDate,
    dailyProfitAmount,
    nextProfitDate,
    status: "active",
  });

  return investment.populate("plan");
};

/**
 * Get investments by user
 * @param {ObjectId} userId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getInvestmentsByUser = async (userId, filter = {}, options = {}) => {
  const investments = await Investment.paginate(
    { user: userId, ...filter },
    { ...options, populate: "plan" }
  );
  return investments;
};

/**
 * Get active investments by user
 * @param {ObjectId} userId
 * @returns {Promise<Investment[]>}
 */
const getActiveInvestments = async (userId) => {
  return Investment.find({ user: userId, status: "active" }).populate("plan");
};

/**
 * Get investment by id
 * @param {ObjectId} id
 * @returns {Promise<Investment>}
 */
const getInvestmentById = async (id) => {
  return Investment.findById(id).populate("plan");
};

/**
 * Query all investments (admin)
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const queryInvestments = async (filter, options) => {
  return Investment.paginate(filter, { ...options, populate: "plan user" });
};

/**
 * Process completed investments
 * @returns {Promise<number>} Number of completed investments
 */
const processCompletedInvestments = async () => {
  const now = new Date();
  const completedInvestments = await Investment.find({
    status: "active",
    endDate: { $lte: now },
  }).populate("plan");

  let count = 0;
  for (const investment of completedInvestments) {
    // Add profit and principal to wallet
    const totalReturn = investment.amount + investment.expectedProfit;
    await walletService.addProfit(investment.user, totalReturn);

    investment.status = "completed";
    investment.earnedProfit = investment.expectedProfit;
    await investment.save();
    count++;
  }

  return count;
};

/**
 * Get user investment statistics
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getUserInvestmentStats = async (userId) => {
  const investments = await Investment.find({ user: userId });

  const stats = {
    totalInvestments: investments.length,
    activeInvestments: investments.filter(i => i.status === "active").length,
    completedInvestments: investments.filter(i => i.status === "completed").length,
    totalInvested: investments.reduce((sum, i) => sum + i.amount, 0),
    totalExpectedProfit: investments.filter(i => i.status === "active").reduce((sum, i) => sum + i.expectedProfit, 0),
    totalEarnedProfit: investments.reduce((sum, i) => sum + i.earnedProfit, 0),
  };

  return stats;
};

module.exports = {
  createInvestment,
  getInvestmentsByUser,
  getActiveInvestments,
  getInvestmentById,
  queryInvestments,
  processCompletedInvestments,
  getUserInvestmentStats,
  calculateExpectedProfit,
  calculateEndDate,
  getDurationInMinutes,
  getProfitIntervalMs,
};
