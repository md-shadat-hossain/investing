const httpStatus = require("http-status");
const { Investment, ProfitDistribution, ProfitAdjustment, InvestmentPlan } = require("../models");
const ApiError = require("../utils/ApiError");
const walletService = require("./wallet.service");
const transactionService = require("./transaction.service");
const notificationService = require("./notification.service");

const investmentService = require("./investment.service");

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

/**
 * Calculate per-interval profit for an investment
 * Returns the profit amount for one ROI interval (hourly/daily/weekly/monthly)
 * @param {Investment} investment
 * @param {InvestmentPlan} plan
 * @returns {number}
 */
const calculateDailyProfit = (investment, plan) => {
  const { amount } = investment;
  const planRoi = plan.roi;
  const planDuration = plan.duration;

  let profit = 0;

  if (plan.roiType === "hourly") {
    // Hourly ROI: profit per hour
    profit = (amount * planRoi) / 100;
  } else if (plan.roiType === "daily") {
    // Daily ROI: profit per day
    profit = (amount * planRoi) / 100;
  } else if (plan.roiType === "total") {
    // Total ROI: spread evenly across total duration in days
    const totalMinutes = investmentService.getDurationInMinutes(plan);
    const totalDays = totalMinutes / (24 * 60);
    profit = (amount * planRoi) / 100 / (totalDays || 1);
  } else if (plan.roiType === "monthly") {
    // Monthly ROI: convert to daily
    profit = (amount * planRoi) / 100 / 30;
  } else if (plan.roiType === "weekly") {
    // Weekly ROI: convert to daily
    profit = (amount * planRoi) / 100 / 7;
  }

  return profit;
};

/**
 * Get applicable profit adjustments for an investment
 * @param {ObjectId} investmentId
 * @param {ObjectId} userId
 * @param {ObjectId} planId
 * @param {Date} date
 * @returns {Promise<Array>}
 */
const getApplicableAdjustments = async (investmentId, userId, planId, date = new Date()) => {
  const adjustments = await ProfitAdjustment.find({
    isActive: true,
    startDate: { $lte: date },
    $or: [
      { endDate: null },
      { endDate: { $gte: date } }
    ],
    $or: [
      { type: "global" },
      { type: "user", targetUser: userId },
      { type: "investment", targetInvestment: investmentId },
      { type: "plan", targetPlan: planId }
    ]
  }).sort({ priority: -1 });

  return adjustments;
};

/**
 * Apply adjustments to profit amount
 * @param {number} baseProfit
 * @param {Array} adjustments
 * @returns {Object}
 */
const applyAdjustments = (baseProfit, adjustments) => {
  let adjustedProfit = baseProfit;
  let appliedAdjustment = null;

  // Apply highest priority adjustment
  if (adjustments.length > 0) {
    const adjustment = adjustments[0];
    appliedAdjustment = adjustment;

    if (adjustment.adjustmentType === "percentage") {
      adjustedProfit = (baseProfit * adjustment.adjustmentValue) / 100;
    } else if (adjustment.adjustmentType === "fixed_amount") {
      adjustedProfit = adjustment.adjustmentValue;
    } else if (adjustment.adjustmentType === "multiplier") {
      adjustedProfit = baseProfit * adjustment.adjustmentValue;
    }
  }

  return { adjustedProfit, appliedAdjustment };
};

/**
 * Distribute profit for a single investment
 * @param {ObjectId} investmentId
 * @param {boolean} testMode - If true, sets next profit date to 1 minute from now
 * @returns {Promise<Object>}
 */
const distributeProfitForInvestment = async (investmentId, testMode = false) => {
  const investment = await Investment.findById(investmentId).populate("plan");

  if (!investment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Investment not found");
  }

  // Check if investment is active and not paused
  if (investment.status !== "active" || investment.isPaused) {
    return { success: false, reason: "Investment not active or paused" };
  }

  // Check if investment has ended
  if (new Date() > investment.endDate) {
    investment.status = "completed";
    await investment.save();
    return { success: false, reason: "Investment completed" };
  }

  // Calculate daily profit
  const dailyProfit = calculateDailyProfit(investment, investment.plan);

  // Get applicable adjustments
  const adjustments = await getApplicableAdjustments(
    investment._id,
    investment.user,
    investment.plan._id
  );

  // Apply adjustments
  const { adjustedProfit, appliedAdjustment } = applyAdjustments(dailyProfit, adjustments);

  // Check if adding profit would exceed expected profit
  const remainingProfit = investment.expectedProfit - investment.earnedProfit;
  const profitToDistribute = Math.min(adjustedProfit, remainingProfit);

  if (profitToDistribute <= 0) {
    investment.status = "completed";
    await investment.save();
    return { success: false, reason: "Expected profit reached" };
  }

  try {
    // Add profit to wallet
    await walletService.addProfit(investment.user, profitToDistribute);

    // Create transaction record
    const transaction = await transactionService.createInternalTransaction(investment.user, {
      type: "profit",
      amount: profitToDistribute,
      description: `${capitalize(investment.plan.roiType)} profit from ${investment.plan.name} investment`,
      reference: investment._id,
      referenceModel: "Investment",
    });

    // Create profit distribution record
    const distribution = await ProfitDistribution.create({
      investment: investment._id,
      user: investment.user,
      amount: profitToDistribute,
      originalRate: (dailyProfit / investment.amount) * 100,
      appliedRate: (adjustedProfit / investment.amount) * 100,
      adjustedBy: appliedAdjustment?.createdBy || null,
      adjustmentReason: appliedAdjustment?.reason || null,
      distributionDate: new Date(),
      status: "completed",
      transactionId: transaction.transactionId || `PROFIT-${Date.now()}`,
    });

    // Update investment
    investment.earnedProfit += profitToDistribute;
    investment.lastProfitDate = new Date();
    investment.totalProfitDistributions += 1;
    investment.dailyProfitAmount = dailyProfit;

    // Set next profit date based on ROI interval
    const nextDate = new Date();
    if (testMode) {
      // TEST MODE: Set next profit date to 1 minute from now
      nextDate.setMinutes(nextDate.getMinutes() + 1);
      investment.nextProfitDate = nextDate;
    } else {
      // PRODUCTION MODE: Set based on plan's ROI type
      const intervalMs = investmentService.getProfitIntervalMs(investment.plan.roiType);
      nextDate.setTime(nextDate.getTime() + intervalMs);
      investment.nextProfitDate = nextDate;
    }

    // Check if investment is complete
    if (investment.earnedProfit >= investment.expectedProfit) {
      investment.status = "completed";
    }

    await investment.save();

    // Send notification
    const roiLabel = investment.plan.roiType === "hourly" ? "Hourly" : investment.plan.roiType === "total" ? "Investment" : capitalize(investment.plan.roiType);
    await notificationService.sendToUser(
      investment.user,
      `${roiLabel} Profit Received`,
      `You received $${profitToDistribute.toFixed(2)} profit from your ${investment.plan.name} investment.`,
      "investment"
    );

    return {
      success: true,
      investment: investment._id,
      amount: profitToDistribute,
      distribution: distribution._id,
    };
  } catch (error) {
    console.error("Error distributing profit:", error);
    throw error;
  }
};

/**
 * Distribute profits for all active investments (Run daily via cron)
 * @param {boolean} testMode - If true, runs in test mode (1 minute intervals)
 * @returns {Promise<Object>}
 */
const distributeAllProfits = async (testMode = false) => {
  const now = new Date();

  // Find all active investments that need profit distribution
  // Use current time (not midnight) so hourly/minute intervals are picked up
  const investments = await Investment.find({
    status: "active",
    isPaused: false,
    startDate: { $lte: now },
    endDate: { $gte: now },
    $or: [
      { nextProfitDate: null },
      { nextProfitDate: { $lte: now } }
    ]
  });

  const results = {
    total: investments.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  for (const investment of investments) {
    try {
      const result = await distributeProfitForInvestment(investment._id, testMode);

      if (result.success) {
        results.successful++;
      } else {
        results.skipped++;
      }

      results.details.push(result);
    } catch (error) {
      results.failed++;
      results.details.push({
        success: false,
        investment: investment._id,
        error: error.message,
      });
    }
  }

  console.log(`Profit Distribution Complete: ${results.successful} successful, ${results.failed} failed, ${results.skipped} skipped`);

  return results;
};

/**
 * Get profit distribution history for investment
 * @param {ObjectId} investmentId
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getProfitDistributionHistory = async (investmentId, options = {}) => {
  return ProfitDistribution.paginate(
    { investment: investmentId },
    { ...options, sort: "-distributionDate" }
  );
};

/**
 * Get profit distribution history for user
 * @param {ObjectId} userId
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getUserProfitHistory = async (userId, options = {}) => {
  return ProfitDistribution.paginate(
    { user: userId },
    { ...options, sort: "-distributionDate", populate: "investment" }
  );
};

/**
 * Pause investment profit distribution (Admin)
 * @param {ObjectId} investmentId
 * @param {ObjectId} adminId
 * @param {string} reason
 * @returns {Promise<Investment>}
 */
const pauseInvestment = async (investmentId, adminId, reason) => {
  const investment = await Investment.findById(investmentId);

  if (!investment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Investment not found");
  }

  investment.isPaused = true;
  investment.pausedBy = adminId;
  investment.pausedAt = new Date();
  investment.pauseReason = reason;

  await investment.save();

  // Notify user
  await notificationService.sendToUser(
    investment.user,
    "Investment Paused",
    `Your investment has been paused by admin. Reason: ${reason}`,
    "investment"
  );

  return investment;
};

/**
 * Resume investment profit distribution (Admin)
 * @param {ObjectId} investmentId
 * @returns {Promise<Investment>}
 */
const resumeInvestment = async (investmentId) => {
  const investment = await Investment.findById(investmentId);

  if (!investment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Investment not found");
  }

  investment.isPaused = false;
  investment.pausedBy = null;
  investment.pausedAt = null;
  investment.pauseReason = null;

  await investment.save();

  // Notify user
  await notificationService.sendToUser(
    investment.user,
    "Investment Resumed",
    "Your investment has been resumed. Daily profit distribution will continue.",
    "investment"
  );

  return investment;
};

/**
 * Manual profit distribution for specific investment (Admin)
 * @param {ObjectId} investmentId
 * @param {number} amount
 * @param {ObjectId} adminId
 * @param {string} reason
 * @returns {Promise<Object>}
 */
const manualProfitDistribution = async (investmentId, amount, adminId, reason) => {
  const investment = await Investment.findById(investmentId).populate("plan");

  if (!investment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Investment not found");
  }

  // Add profit to wallet
  await walletService.addProfit(investment.user, amount);

  // Create transaction record
  const transaction = await transactionService.createInternalTransaction(investment.user, {
    type: "profit",
    amount,
    description: `Manual profit adjustment: ${reason}`,
    reference: investment._id,
    referenceModel: "Investment",
  });

  // Create profit distribution record
  const distribution = await ProfitDistribution.create({
    investment: investment._id,
    user: investment.user,
    amount,
    originalRate: 0,
    appliedRate: (amount / investment.amount) * 100,
    adjustedBy: adminId,
    adjustmentReason: reason,
    distributionDate: new Date(),
    status: "completed",
    transactionId: transaction.transactionId || `PROFIT-MANUAL-${Date.now()}`,
  });

  // Update investment
  investment.earnedProfit += amount;
  await investment.save();

  return { distribution, transaction };
};

module.exports = {
  calculateDailyProfit,
  distributeProfitForInvestment,
  distributeAllProfits,
  getProfitDistributionHistory,
  getUserProfitHistory,
  pauseInvestment,
  resumeInvestment,
  manualProfitDistribution,
  getApplicableAdjustments,
  applyAdjustments,
};
