const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createPlan = {
  body: Joi.object().keys({
    name: Joi.string().required().trim(),
    description: Joi.string().allow("", null),
    minDeposit: Joi.number().required().min(0),
    maxDeposit: Joi.number().required().min(0),
    roi: Joi.number().required().min(0),
    roiType: Joi.string().valid("hourly", "daily", "weekly", "monthly", "total").default("daily"),
    duration: Joi.number().required().min(1),
    durationType: Joi.string().valid("minutes", "hours", "days", "weeks", "months").default("days"),
    referralBonus: Joi.number().min(0).default(5),
    isPopular: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true),
    features: Joi.array().items(Joi.string()),
  }),
};

const getPlans = {
  query: Joi.object().keys({
    name: Joi.string(),
    isActive: Joi.boolean(),
    isPopular: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPlan = {
  params: Joi.object().keys({
    planId: Joi.string().custom(objectId),
  }),
};

const updatePlan = {
  params: Joi.object().keys({
    planId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
      description: Joi.string().allow("", null),
      minDeposit: Joi.number().min(0),
      maxDeposit: Joi.number().min(0),
      roi: Joi.number().min(0),
      roiType: Joi.string().valid("hourly", "daily", "weekly", "monthly", "total"),
      duration: Joi.number().min(1),
      durationType: Joi.string().valid("minutes", "hours", "days", "weeks", "months"),
      referralBonus: Joi.number().min(0),
      isPopular: Joi.boolean(),
      isActive: Joi.boolean(),
      features: Joi.array().items(Joi.string()),
    })
    .min(1),
};

const deletePlan = {
  params: Joi.object().keys({
    planId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
};
