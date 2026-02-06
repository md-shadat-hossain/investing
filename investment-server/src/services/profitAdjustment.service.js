const httpStatus = require("http-status");
const { ProfitAdjustment } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create profit adjustment
 * @param {Object} adjustmentData
 * @param {ObjectId} adminId
 * @returns {Promise<ProfitAdjustment>}
 */
const createAdjustment = async (adjustmentData, adminId) => {
  // Validate target based on type
  if (adjustmentData.type === "user" && !adjustmentData.targetUser) {
    throw new ApiError(httpStatus.BAD_REQUEST, "targetUser is required for user-type adjustment");
  }
  if (adjustmentData.type === "investment" && !adjustmentData.targetInvestment) {
    throw new ApiError(httpStatus.BAD_REQUEST, "targetInvestment is required for investment-type adjustment");
  }
  if (adjustmentData.type === "plan" && !adjustmentData.targetPlan) {
    throw new ApiError(httpStatus.BAD_REQUEST, "targetPlan is required for plan-type adjustment");
  }

  const adjustment = await ProfitAdjustment.create({
    ...adjustmentData,
    createdBy: adminId,
  });

  return adjustment;
};

/**
 * Get all profit adjustments
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const queryAdjustments = async (filter, options) => {
  const adjustments = await ProfitAdjustment.paginate(filter, {
    ...options,
    populate: "createdBy targetUser targetInvestment targetPlan",
  });
  return adjustments;
};

/**
 * Get adjustment by ID
 * @param {ObjectId} adjustmentId
 * @returns {Promise<ProfitAdjustment>}
 */
const getAdjustmentById = async (adjustmentId) => {
  const adjustment = await ProfitAdjustment.findById(adjustmentId)
    .populate("createdBy targetUser targetInvestment targetPlan");

  if (!adjustment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Profit adjustment not found");
  }

  return adjustment;
};

/**
 * Update adjustment
 * @param {ObjectId} adjustmentId
 * @param {Object} updateBody
 * @returns {Promise<ProfitAdjustment>}
 */
const updateAdjustmentById = async (adjustmentId, updateBody) => {
  const adjustment = await getAdjustmentById(adjustmentId);
  Object.assign(adjustment, updateBody);
  await adjustment.save();
  return adjustment;
};

/**
 * Delete adjustment
 * @param {ObjectId} adjustmentId
 * @returns {Promise<ProfitAdjustment>}
 */
const deleteAdjustmentById = async (adjustmentId) => {
  const adjustment = await getAdjustmentById(adjustmentId);
  await adjustment.deleteOne();
  return adjustment;
};

/**
 * Toggle adjustment active status
 * @param {ObjectId} adjustmentId
 * @returns {Promise<ProfitAdjustment>}
 */
const toggleAdjustment = async (adjustmentId) => {
  const adjustment = await getAdjustmentById(adjustmentId);
  adjustment.isActive = !adjustment.isActive;
  await adjustment.save();
  return adjustment;
};

/**
 * Get active adjustments for a user
 * @param {ObjectId} userId
 * @returns {Promise<Array>}
 */
const getUserAdjustments = async (userId) => {
  const now = new Date();
  const adjustments = await ProfitAdjustment.find({
    isActive: true,
    $or: [
      { type: "global" },
      { type: "user", targetUser: userId }
    ],
    startDate: { $lte: now },
    $or: [
      { endDate: null },
      { endDate: { $gte: now } }
    ]
  }).sort({ priority: -1 });

  return adjustments;
};

/**
 * Get active adjustments for an investment
 * @param {ObjectId} investmentId
 * @returns {Promise<Array>}
 */
const getInvestmentAdjustments = async (investmentId) => {
  const now = new Date();
  const adjustments = await ProfitAdjustment.find({
    isActive: true,
    type: "investment",
    targetInvestment: investmentId,
    startDate: { $lte: now },
    $or: [
      { endDate: null },
      { endDate: { $gte: now } }
    ]
  }).sort({ priority: -1 });

  return adjustments;
};

module.exports = {
  createAdjustment,
  queryAdjustments,
  getAdjustmentById,
  updateAdjustmentById,
  deleteAdjustmentById,
  toggleAdjustment,
  getUserAdjustments,
  getInvestmentAdjustments,
};
