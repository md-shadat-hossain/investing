const httpStatus = require("http-status");
const { InvestmentPlan } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create an investment plan
 * @param {Object} planBody
 * @returns {Promise<InvestmentPlan>}
 */
const createPlan = async (planBody) => {
  return InvestmentPlan.create(planBody);
};

/**
 * Query for investment plans
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryPlans = async (filter, options) => {
  const plans = await InvestmentPlan.paginate(filter, options);
  return plans;
};

/**
 * Get all active plans
 * @returns {Promise<InvestmentPlan[]>}
 */
const getActivePlans = async () => {
  return InvestmentPlan.find({ isActive: true }).sort({ minDeposit: 1 });
};

/**
 * Get plan by id
 * @param {ObjectId} id
 * @returns {Promise<InvestmentPlan>}
 */
const getPlanById = async (id) => {
  return InvestmentPlan.findById(id);
};

/**
 * Update plan by id
 * @param {ObjectId} planId
 * @param {Object} updateBody
 * @returns {Promise<InvestmentPlan>}
 */
const updatePlanById = async (planId, updateBody) => {
  const plan = await getPlanById(planId);
  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Plan not found");
  }
  Object.assign(plan, updateBody);
  await plan.save();
  return plan;
};

/**
 * Delete plan by id
 * @param {ObjectId} planId
 * @returns {Promise<InvestmentPlan>}
 */
const deletePlanById = async (planId) => {
  const plan = await getPlanById(planId);
  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, "Plan not found");
  }
  await plan.deleteOne();
  return plan;
};

/**
 * Increment plan statistics
 * @param {ObjectId} planId
 * @param {number} amount
 * @returns {Promise<InvestmentPlan>}
 */
const incrementPlanStats = async (planId, amount) => {
  return InvestmentPlan.findByIdAndUpdate(
    planId,
    {
      $inc: {
        totalInvestors: 1,
        totalInvested: amount,
      },
    },
    { new: true }
  );
};

module.exports = {
  createPlan,
  queryPlans,
  getActivePlans,
  getPlanById,
  updatePlanById,
  deletePlanById,
  incrementPlanStats,
};
