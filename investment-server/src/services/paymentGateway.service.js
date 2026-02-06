const httpStatus = require("http-status");
const { PaymentGateway } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a payment gateway
 * @param {Object} gatewayBody
 * @returns {Promise<PaymentGateway>}
 */
const createGateway = async (gatewayBody) => {
  return PaymentGateway.create(gatewayBody);
};

/**
 * Get all active gateways
 * @param {string} purpose - 'deposit' or 'withdraw' or 'all'
 * @returns {Promise<PaymentGateway[]>}
 */
const getActiveGateways = async (purpose = "all") => {
  const filter = { isActive: true };

  if (purpose === "deposit") {
    filter.isDepositEnabled = true;
  } else if (purpose === "withdraw") {
    filter.isWithdrawEnabled = true;
  }

  return PaymentGateway.find(filter).sort({ sortOrder: 1, name: 1 });
};

/**
 * Get all gateways (admin)
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const queryGateways = async (filter, options) => {
  return PaymentGateway.paginate(filter, { ...options, sort: { sortOrder: 1 } });
};

/**
 * Get gateway by id
 * @param {ObjectId} id
 * @returns {Promise<PaymentGateway>}
 */
const getGatewayById = async (id) => {
  return PaymentGateway.findById(id);
};

/**
 * Update gateway by id
 * @param {ObjectId} gatewayId
 * @param {Object} updateBody
 * @returns {Promise<PaymentGateway>}
 */
const updateGatewayById = async (gatewayId, updateBody) => {
  const gateway = await getGatewayById(gatewayId);
  if (!gateway) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment gateway not found");
  }
  Object.assign(gateway, updateBody);
  await gateway.save();
  return gateway;
};

/**
 * Delete gateway by id
 * @param {ObjectId} gatewayId
 * @returns {Promise<PaymentGateway>}
 */
const deleteGatewayById = async (gatewayId) => {
  const gateway = await getGatewayById(gatewayId);
  if (!gateway) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment gateway not found");
  }
  await gateway.deleteOne();
  return gateway;
};

/**
 * Toggle gateway status
 * @param {ObjectId} gatewayId
 * @returns {Promise<PaymentGateway>}
 */
const toggleGatewayStatus = async (gatewayId) => {
  const gateway = await getGatewayById(gatewayId);
  if (!gateway) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payment gateway not found");
  }
  gateway.isActive = !gateway.isActive;
  await gateway.save();
  return gateway;
};

/**
 * Get gateways by type
 * @param {string} type - 'crypto', 'bank', 'payment_processor'
 * @returns {Promise<PaymentGateway[]>}
 */
const getGatewaysByType = async (type) => {
  return PaymentGateway.find({ type, isActive: true }).sort({ sortOrder: 1 });
};

module.exports = {
  createGateway,
  getActiveGateways,
  queryGateways,
  getGatewayById,
  updateGatewayById,
  deleteGatewayById,
  toggleGatewayStatus,
  getGatewaysByType,
};
