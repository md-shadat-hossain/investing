const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createInvestment = {
  body: Joi.object().keys({
    planId: Joi.string().custom(objectId).required(),
    amount: Joi.number().required().min(1),
  }),
};

const getMyInvestments = {
  query: Joi.object().keys({
    status: Joi.string().valid("active", "completed", "cancelled"),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getInvestment = {
  params: Joi.object().keys({
    investmentId: Joi.string().custom(objectId),
  }),
};

const getAllInvestments = {
  query: Joi.object().keys({
    status: Joi.string().valid("active", "completed", "cancelled"),
    user: Joi.string().custom(objectId),
    plan: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createInvestment,
  getMyInvestments,
  getInvestment,
  getAllInvestments,
};
