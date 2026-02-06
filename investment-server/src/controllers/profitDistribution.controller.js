const httpStatus = require("http-status");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const { profitDistributionService, profitAdjustmentService } = require("../services");
const response = require("../config/response");

// ==================== User Endpoints ====================

// Get my profit history
const getMyProfitHistory = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await profitDistributionService.getUserProfitHistory(req.user._id, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Profit history retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Get profit history for specific investment
const getInvestmentProfitHistory = catchAsync(async (req, res) => {
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await profitDistributionService.getProfitDistributionHistory(
    req.params.investmentId,
    options
  );
  res.status(httpStatus.OK).json(
    response({
      message: "Investment profit history retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// ==================== Admin Endpoints ====================

// Run profit distribution manually
const runProfitDistribution = catchAsync(async (req, res) => {
  const result = await profitDistributionService.distributeAllProfits();
  res.status(httpStatus.OK).json(
    response({
      message: "Profit distribution completed",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Distribute profit for single investment
const distributeSingleProfit = catchAsync(async (req, res) => {
  const result = await profitDistributionService.distributeProfitForInvestment(req.params.investmentId);
  res.status(httpStatus.OK).json(
    response({
      message: result.success ? "Profit distributed successfully" : "Profit distribution skipped",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Pause investment
const pauseInvestment = catchAsync(async (req, res) => {
  const { reason } = req.body;
  const investment = await profitDistributionService.pauseInvestment(
    req.params.investmentId,
    req.user._id,
    reason
  );
  res.status(httpStatus.OK).json(
    response({
      message: "Investment paused successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: investment,
    })
  );
});

// Resume investment
const resumeInvestment = catchAsync(async (req, res) => {
  const investment = await profitDistributionService.resumeInvestment(req.params.investmentId);
  res.status(httpStatus.OK).json(
    response({
      message: "Investment resumed successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: investment,
    })
  );
});

// Manual profit distribution
const manualProfitDistribution = catchAsync(async (req, res) => {
  const { amount, reason } = req.body;
  const result = await profitDistributionService.manualProfitDistribution(
    req.params.investmentId,
    amount,
    req.user._id,
    reason
  );
  res.status(httpStatus.OK).json(
    response({
      message: "Manual profit distributed successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Create profit adjustment
const createAdjustment = catchAsync(async (req, res) => {
  const adjustment = await profitAdjustmentService.createAdjustment(req.body, req.user._id);
  res.status(httpStatus.CREATED).json(
    response({
      message: "Profit adjustment created successfully",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: adjustment,
    })
  );
});

// Get all adjustments
const getAllAdjustments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["type", "isActive", "adjustmentType"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await profitAdjustmentService.queryAdjustments(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Profit adjustments retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Get adjustment by ID
const getAdjustment = catchAsync(async (req, res) => {
  const adjustment = await profitAdjustmentService.getAdjustmentById(req.params.adjustmentId);
  res.status(httpStatus.OK).json(
    response({
      message: "Profit adjustment retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: adjustment,
    })
  );
});

// Update adjustment
const updateAdjustment = catchAsync(async (req, res) => {
  const adjustment = await profitAdjustmentService.updateAdjustmentById(
    req.params.adjustmentId,
    req.body
  );
  res.status(httpStatus.OK).json(
    response({
      message: "Profit adjustment updated successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: adjustment,
    })
  );
});

// Toggle adjustment status
const toggleAdjustment = catchAsync(async (req, res) => {
  const adjustment = await profitAdjustmentService.toggleAdjustment(req.params.adjustmentId);
  res.status(httpStatus.OK).json(
    response({
      message: `Profit adjustment ${adjustment.isActive ? 'activated' : 'deactivated'} successfully`,
      status: "OK",
      statusCode: httpStatus.OK,
      data: adjustment,
    })
  );
});

// Delete adjustment
const deleteAdjustment = catchAsync(async (req, res) => {
  await profitAdjustmentService.deleteAdjustmentById(req.params.adjustmentId);
  res.status(httpStatus.OK).json(
    response({
      message: "Profit adjustment deleted successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

// Get all profit distributions (Admin)
const getAllProfitDistributions = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status", "user", "investment"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const { ProfitDistribution } = require("../models");

  const result = await ProfitDistribution.paginate(filter, {
    ...options,
    populate: "user investment",
  });

  res.status(httpStatus.OK).json(
    response({
      message: "All profit distributions retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

module.exports = {
  // User
  getMyProfitHistory,
  getInvestmentProfitHistory,

  // Admin - Distribution
  runProfitDistribution,
  distributeSingleProfit,
  pauseInvestment,
  resumeInvestment,
  manualProfitDistribution,
  getAllProfitDistributions,

  // Admin - Adjustments
  createAdjustment,
  getAllAdjustments,
  getAdjustment,
  updateAdjustment,
  toggleAdjustment,
  deleteAdjustment,
};
