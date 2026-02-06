const Joi = require("joi");
const { objectId } = require("./custom.validation");

const getMyReferrals = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const validateReferralCode = {
  params: Joi.object().keys({
    code: Joi.string().required(),
  }),
};

const getAllReferrals = {
  query: Joi.object().keys({
    status: Joi.string().valid("pending", "active", "inactive"),
    referrer: Joi.string().custom(objectId),
    referred: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  getMyReferrals,
  validateReferralCode,
  getAllReferrals,
};
