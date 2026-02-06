const httpStatus = require("http-status");
const { Referral, User, Settings } = require("../models");
const ApiError = require("../utils/ApiError");
const walletService = require("./wallet.service");
const transactionService = require("./transaction.service");

// Multi-level commission rates (7 levels)
const COMMISSION_RATES = {
  1: 8,  // Level 1 - 8%
  2: 4,  // Level 2 - 4%
  3: 3,  // Level 3 - 3%
  4: 2,  // Level 4 - 2%
  5: 1,  // Level 5 - 1%
  6: 1,  // Level 6 - 1%
  7: 1,  // Level 7 - 1%
};

/**
 * Create multi-level referral relationships (up to 7 levels)
 * @param {ObjectId} referrerId - Direct referrer
 * @param {ObjectId} referredId - New user
 * @param {string} referralCode
 * @returns {Promise<Array<Referral>>}
 */
const createReferral = async (referrerId, referredId, referralCode) => {
  const referrals = [];

  // Create Level 1 - Direct referral
  const existing = await Referral.findOne({
    referrer: referrerId,
    referred: referredId,
    level: 1
  });

  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Referral relationship already exists");
  }

  const level1Referral = await Referral.create({
    referrer: referrerId,
    referred: referredId,
    referralCode,
    commissionRate: COMMISSION_RATES[1],
    level: 1,
    status: "pending",
  });

  referrals.push(level1Referral);

  // Create Level 2-7 - Indirect referrals (upline chain)
  let currentReferrer = await User.findById(referrerId);

  for (let level = 2; level <= 7; level++) {
    if (!currentReferrer || !currentReferrer.referredBy) {
      break; // No more upline
    }

    const uplineReferrer = await User.findById(currentReferrer.referredBy);
    if (!uplineReferrer) {
      break;
    }

    // Check if this level already exists
    const existingLevel = await Referral.findOne({
      referrer: uplineReferrer._id,
      referred: referredId,
      level: level
    });

    if (!existingLevel) {
      const levelReferral = await Referral.create({
        referrer: uplineReferrer._id,
        referred: referredId,
        referralCode: uplineReferrer.referralCode,
        commissionRate: COMMISSION_RATES[level],
        level: level,
        status: "pending",
      });

      referrals.push(levelReferral);
    }

    currentReferrer = uplineReferrer;
  }

  return referrals;
};

/**
 * Process multi-level referral commissions on deposit
 * @param {ObjectId} userId - User making the deposit
 * @param {number} depositAmount - Deposit amount
 * @returns {Promise<Object>}
 */
const processReferralOnDeposit = async (userId, depositAmount) => {
  // Find all referral relationships for this user (all 7 levels)
  const referrals = await Referral.find({ referred: userId }).sort({ level: 1 });

  if (referrals.length === 0) {
    return null;
  }

  const commissionResults = [];
  let totalCommissionPaid = 0;

  // Process each level
  for (const referral of referrals) {
    const isFirstDeposit = referral.status === "pending";

    // Calculate commission for this level
    const commission = (depositAmount * referral.commissionRate) / 100;

    try {
      // Add to referrer's wallet
      await walletService.addReferralEarnings(referral.referrer, commission);

      // Create transaction record for referrer
      const referrerUser = await User.findById(referral.referrer);
      await transactionService.createInternalTransaction(referral.referrer, {
        type: "referral",
        amount: commission,
        description: `Level ${referral.level} referral commission (${referral.commissionRate}%) from ${isFirstDeposit ? 'first' : ''} deposit`,
        reference: referral._id,
        referenceModel: "Referral",
      });

      // Update referral record
      if (isFirstDeposit) {
        referral.status = "active";
        referral.firstDepositAmount = depositAmount;
        referral.firstDepositDate = new Date();
      }
      referral.totalEarnings += commission;
      await referral.save();

      commissionResults.push({
        level: referral.level,
        referrer: referral.referrer,
        referrerName: referrerUser?.fullName || referrerUser?.email,
        commission,
        commissionRate: referral.commissionRate,
      });

      totalCommissionPaid += commission;
    } catch (error) {
      console.error(`Error processing referral commission for level ${referral.level}:`, error);
      // Continue processing other levels even if one fails
    }
  }

  return {
    commissions: commissionResults,
    totalCommissionPaid,
    levelsProcessed: commissionResults.length,
  };
};

/**
 * Get referrals by referrer
 * @param {ObjectId} referrerId
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getReferralsByReferrer = async (referrerId, options = {}) => {
  return Referral.paginate(
    { referrer: referrerId },
    { ...options, populate: "referred" }
  );
};

/**
 * Get referral statistics for user (multi-level breakdown)
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getReferralStats = async (userId) => {
  const referrals = await Referral.find({ referrer: userId }).populate("referred", "fullName email createdAt");

  // Group by level
  const levelBreakdown = {};
  for (let i = 1; i <= 7; i++) {
    const levelReferrals = referrals.filter(r => r.level === i);
    levelBreakdown[`level${i}`] = {
      count: levelReferrals.length,
      active: levelReferrals.filter(r => r.status === "active").length,
      pending: levelReferrals.filter(r => r.status === "pending").length,
      earnings: levelReferrals.reduce((sum, r) => sum + r.totalEarnings, 0),
      commissionRate: COMMISSION_RATES[i],
    };
  }

  const stats = {
    totalReferrals: referrals.length,
    activeReferrals: referrals.filter(r => r.status === "active").length,
    pendingReferrals: referrals.filter(r => r.status === "pending").length,
    totalEarnings: referrals.reduce((sum, r) => sum + r.totalEarnings, 0),
    levelBreakdown,
    referrals: referrals.map(r => ({
      id: r._id,
      user: r.referred?.fullName || r.referred?.email || "Unknown",
      date: r.createdAt,
      status: r.status,
      earnings: r.totalEarnings,
      level: r.level,
      commissionRate: r.commissionRate,
    })),
  };

  // Get user's referral code
  const user = await User.findById(userId);
  stats.referralCode = user?.referralCode || null;
  stats.referralLink = user?.referralCode ? `https://wealthflow.com/register?ref=${user.referralCode}` : null;

  return stats;
};

/**
 * Validate referral code
 * @param {string} referralCode
 * @returns {Promise<User>}
 */
const validateReferralCode = async (referralCode) => {
  const user = await User.findByReferralCode(referralCode);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid referral code");
  }
  return user;
};

/**
 * Get all referrals (admin)
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const queryReferrals = async (filter, options) => {
  return Referral.paginate(filter, {
    ...options,
    populate: "referrer referred",
  });
};

/**
 * Get team/network structure for user
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getTeamNetwork = async (userId) => {
  // Get all direct referrals (Level 1 only)
  const directReferrals = await Referral.find({
    referrer: userId,
    level: 1
  }).populate("referred", "fullName email image createdAt");

  const networkTree = [];

  for (const referral of directReferrals) {
    const member = {
      id: referral.referred._id,
      name: referral.referred.fullName || referral.referred.email,
      email: referral.referred.email,
      image: referral.referred.image,
      joinedDate: referral.referred.createdAt,
      status: referral.status,
      earnings: referral.totalEarnings,
      level: 1,
      children: [],
    };

    // Recursively get their referrals (up to 7 levels deep)
    member.children = await getChildrenReferrals(referral.referred._id, 2);
    networkTree.push(member);
  }

  // Calculate team statistics
  const allTeamMembers = await Referral.find({ referrer: userId });
  const teamStats = {
    totalMembers: allTeamMembers.length,
    activeMembers: allTeamMembers.filter(r => r.status === "active").length,
    totalTeamEarnings: allTeamMembers.reduce((sum, r) => sum + r.totalEarnings, 0),
    levelCounts: {},
  };

  for (let i = 1; i <= 7; i++) {
    teamStats.levelCounts[`level${i}`] = allTeamMembers.filter(r => r.level === i).length;
  }

  return {
    networkTree,
    teamStats,
  };
};

/**
 * Helper function to recursively get children referrals
 * @param {ObjectId} userId
 * @param {Number} currentLevel
 * @returns {Promise<Array>}
 */
const getChildrenReferrals = async (userId, currentLevel) => {
  if (currentLevel > 7) {
    return []; // Max 7 levels
  }

  const childReferrals = await Referral.find({
    referrer: userId,
    level: 1 // Only direct referrals of this user
  }).populate("referred", "fullName email image createdAt");

  const children = [];
  for (const referral of childReferrals) {
    const child = {
      id: referral.referred._id,
      name: referral.referred.fullName || referral.referred.email,
      email: referral.referred.email,
      image: referral.referred.image,
      joinedDate: referral.referred.createdAt,
      status: referral.status,
      earnings: referral.totalEarnings,
      level: currentLevel,
      children: await getChildrenReferrals(referral.referred._id, currentLevel + 1),
    };
    children.push(child);
  }

  return children;
};

/**
 * Get commission earnings breakdown by level
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getCommissionBreakdown = async (userId) => {
  const referrals = await Referral.find({ referrer: userId });

  const breakdown = [];
  for (let level = 1; level <= 7; level++) {
    const levelReferrals = referrals.filter(r => r.level === level);
    breakdown.push({
      level,
      commissionRate: COMMISSION_RATES[level],
      totalMembers: levelReferrals.length,
      activeMembers: levelReferrals.filter(r => r.status === "active").length,
      totalEarnings: levelReferrals.reduce((sum, r) => sum + r.totalEarnings, 0),
    });
  }

  return breakdown;
};

module.exports = {
  createReferral,
  processReferralOnDeposit,
  getReferralsByReferrer,
  getReferralStats,
  validateReferralCode,
  queryReferrals,
  getTeamNetwork,
  getCommissionBreakdown,
  COMMISSION_RATES,
};
