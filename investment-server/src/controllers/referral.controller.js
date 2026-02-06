const httpStatus = require("http-status");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const { referralService } = require("../services");
const response = require("../config/response");

// Get my referrals
const getMyReferrals = catchAsync(async (req, res) => {
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await referralService.getReferralsByReferrer(req.user._id, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Referrals retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Get referral stats
const getReferralStats = catchAsync(async (req, res) => {
  const stats = await referralService.getReferralStats(req.user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "Referral statistics retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: stats,
    })
  );
});

// Validate referral code
const validateReferralCode = catchAsync(async (req, res) => {
  const { code } = req.params;
  const user = await referralService.validateReferralCode(code);
  res.status(httpStatus.OK).json(
    response({
      message: "Valid referral code",
      status: "OK",
      statusCode: httpStatus.OK,
      data: { valid: true, referrerName: user.fullName || user.email },
    })
  );
});

// Admin: Get all referrals
const getAllReferrals = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status", "referrer", "referred"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await referralService.queryReferrals(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "All referrals retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Get team/network structure
const getTeamNetwork = catchAsync(async (req, res) => {
  const network = await referralService.getTeamNetwork(req.user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "Team network retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: network,
    })
  );
});

// Get commission breakdown by level
const getCommissionBreakdown = catchAsync(async (req, res) => {
  const breakdown = await referralService.getCommissionBreakdown(req.user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "Commission breakdown retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: breakdown,
    })
  );
});

// Get commission rates info
const getCommissionRates = catchAsync(async (req, res) => {
  const rates = [];
  for (let level = 1; level <= 7; level++) {
    rates.push({
      level,
      commissionRate: referralService.COMMISSION_RATES[level],
      description: `Level ${level} - ${referralService.COMMISSION_RATES[level]}%`,
    });
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Commission rates retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: rates,
    })
  );
});

module.exports = {
  getMyReferrals,
  getReferralStats,
  validateReferralCode,
  getAllReferrals,
  getTeamNetwork,
  getCommissionBreakdown,
  getCommissionRates,
};
