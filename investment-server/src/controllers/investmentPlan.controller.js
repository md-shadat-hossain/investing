const httpStatus = require("http-status");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const { investmentPlanService } = require("../services");
const response = require("../config/response");
const ApiError = require("../utils/ApiError");

const createPlan = catchAsync(async (req, res) => {
  const plan = await investmentPlanService.createPlan(req.body);
  res.status(httpStatus.CREATED).json(
    response({
      message: "Investment plan created successfully",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: plan,
    })
  );
});

const getPlans = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["name", "isActive", "isPopular"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await investmentPlanService.queryPlans(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Investment plans retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

const getActivePlans = catchAsync(async (req, res) => {
  const plans = await investmentPlanService.getActivePlans();
  res.status(httpStatus.OK).json(
    response({
      message: "Active investment plans retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: plans,
    })
  );
});

const getPlan = catchAsync(async (req, res) => {
  const plan = await investmentPlanService.getPlanById(req.params.planId);
  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Investment plan not found");
  }
  res.status(httpStatus.OK).json(
    response({
      message: "Investment plan retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: plan,
    })
  );
});

const updatePlan = catchAsync(async (req, res) => {
  const plan = await investmentPlanService.updatePlanById(req.params.planId, req.body);
  res.status(httpStatus.OK).json(
    response({
      message: "Investment plan updated successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: plan,
    })
  );
});

const deletePlan = catchAsync(async (req, res) => {
  await investmentPlanService.deletePlanById(req.params.planId);
  res.status(httpStatus.OK).json(
    response({
      message: "Investment plan deleted successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: {},
    })
  );
});

module.exports = {
  createPlan,
  getPlans,
  getActivePlans,
  getPlan,
  updatePlan,
  deletePlan,
};
