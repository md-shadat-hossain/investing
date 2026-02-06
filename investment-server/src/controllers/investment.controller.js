const httpStatus = require("http-status");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const { investmentService, notificationService } = require("../services");
const response = require("../config/response");

const createInvestment = catchAsync(async (req, res) => {
  const { planId, amount } = req.body;
  const investment = await investmentService.createInvestment(req.user._id, planId, amount);

  // Send notification
  await notificationService.sendToUser(
    req.user._id,
    "Investment Started",
    `You have successfully invested $${amount.toLocaleString()} in ${investment.plan.name}.`,
    "investment"
  );

  res.status(httpStatus.CREATED).json(
    response({
      message: "Investment created successfully",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: investment,
    })
  );
});

const getMyInvestments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await investmentService.getInvestmentsByUser(req.user._id, filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Investments retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getActiveInvestments = catchAsync(async (req, res) => {
  const investments = await investmentService.getActiveInvestments(req.user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "Active investments retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: investments,
    })
  );
});

const getInvestment = catchAsync(async (req, res) => {
  const investment = await investmentService.getInvestmentById(req.params.investmentId);
  if (!investment) {
    const ApiError = require("../utils/ApiError");
    throw new ApiError(httpStatus.NOT_FOUND, "Investment not found");
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Investment retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: investment,
    })
  );
});

const getInvestmentStats = catchAsync(async (req, res) => {
  const stats = await investmentService.getUserInvestmentStats(req.user._id);
  res.status(httpStatus.OK).json(
    response({
      message: "Investment statistics retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: stats,
    })
  );
});

// Admin: Get all investments
const getAllInvestments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status", "user", "plan"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await investmentService.queryInvestments(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "All investments retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

module.exports = {
  createInvestment,
  getMyInvestments,
  getActiveInvestments,
  getInvestment,
  getInvestmentStats,
  getAllInvestments,
};
