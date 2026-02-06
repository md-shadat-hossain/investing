const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createGateway = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    type: Joi.string().valid("crypto", "bank", "payment_processor").required(),
    currency: Joi.string().required(),
    symbol: Joi.string().allow("", null),
    walletAddress: Joi.string().allow("", null),
    qrCode: Joi.string().allow("", null),
    bankDetails: Joi.object().keys({
      bankName: Joi.string().allow("", null),
      accountNumber: Joi.string().allow("", null),
      accountName: Joi.string().allow("", null),
      routingNumber: Joi.string().allow("", null),
      swiftCode: Joi.string().allow("", null),
      iban: Joi.string().allow("", null),
    }),
    minDeposit: Joi.number().min(0).default(10),
    maxDeposit: Joi.number().min(0).default(100000),
    minWithdraw: Joi.number().min(0).default(10),
    maxWithdraw: Joi.number().min(0).default(50000),
    depositFee: Joi.number().min(0).default(0),
    depositFeeType: Joi.string().valid("fixed", "percentage").default("percentage"),
    withdrawFee: Joi.number().min(0).default(0),
    withdrawFeeType: Joi.string().valid("fixed", "percentage").default("percentage"),
    processingTime: Joi.string().default("1-24 hours"),
    instructions: Joi.string().allow("", null),
    icon: Joi.string().allow("", null),
    isActive: Joi.boolean().default(true),
    isDepositEnabled: Joi.boolean().default(true),
    isWithdrawEnabled: Joi.boolean().default(true),
    sortOrder: Joi.number().default(0),
  }),
};

const getActiveGateways = {
  query: Joi.object().keys({
    purpose: Joi.string().valid("deposit", "withdraw", "all"),
  }),
};

const getAllGateways = {
  query: Joi.object().keys({
    type: Joi.string().valid("crypto", "bank", "payment_processor"),
    isActive: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getGateway = {
  params: Joi.object().keys({
    gatewayId: Joi.string().custom(objectId),
  }),
};

const updateGateway = {
  params: Joi.object().keys({
    gatewayId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      type: Joi.string().valid("crypto", "bank", "payment_processor"),
      currency: Joi.string(),
      symbol: Joi.string().allow("", null),
      walletAddress: Joi.string().allow("", null),
      qrCode: Joi.string().allow("", null),
      bankDetails: Joi.object().keys({
        bankName: Joi.string().allow("", null),
        accountNumber: Joi.string().allow("", null),
        accountName: Joi.string().allow("", null),
        routingNumber: Joi.string().allow("", null),
        swiftCode: Joi.string().allow("", null),
        iban: Joi.string().allow("", null),
      }),
      minDeposit: Joi.number().min(0),
      maxDeposit: Joi.number().min(0),
      minWithdraw: Joi.number().min(0),
      maxWithdraw: Joi.number().min(0),
      depositFee: Joi.number().min(0),
      depositFeeType: Joi.string().valid("fixed", "percentage"),
      withdrawFee: Joi.number().min(0),
      withdrawFeeType: Joi.string().valid("fixed", "percentage"),
      processingTime: Joi.string(),
      instructions: Joi.string().allow("", null),
      icon: Joi.string().allow("", null),
      isActive: Joi.boolean(),
      isDepositEnabled: Joi.boolean(),
      isWithdrawEnabled: Joi.boolean(),
      sortOrder: Joi.number(),
    })
    .min(1),
};

const deleteGateway = {
  params: Joi.object().keys({
    gatewayId: Joi.string().custom(objectId),
  }),
};

const toggleGatewayStatus = {
  params: Joi.object().keys({
    gatewayId: Joi.string().custom(objectId),
  }),
};

const getGatewaysByType = {
  params: Joi.object().keys({
    type: Joi.string().valid("crypto", "bank", "payment_processor").required(),
  }),
};

module.exports = {
  createGateway,
  getActiveGateways,
  getAllGateways,
  getGateway,
  updateGateway,
  deleteGateway,
  toggleGatewayStatus,
  getGatewaysByType,
};
