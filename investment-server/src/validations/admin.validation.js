const Joi = require("joi");
const { objectId } = require("./custom.validation");

const getAllUsers = {
  query: Joi.object().keys({
    role: Joi.string().valid("user", "admin", "superAdmin"),
    isEmailVerified: Joi.boolean(),
    isBlocked: Joi.boolean(),
    kycStatus: Joi.string().valid("pending", "submitted", "verified", "rejected"),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUserDetails = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const toggleUserBlock = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reason: Joi.string().allow("", null),
  }),
};

const updateKycStatus = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid("pending", "submitted", "verified", "rejected").required(),
    rejectionReason: Joi.string().when("status", {
      is: "rejected",
      then: Joi.required(),
      otherwise: Joi.allow("", null),
    }),
  }),
};

const addUserBalance = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required().min(0.01),
    reason: Joi.string().allow("", null),
  }),
};

const deductUserBalance = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    amount: Joi.number().required().min(0.01),
    reason: Joi.string().allow("", null),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const getRecentActivities = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(100),
  }),
};

const updateUserProfile = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      firstName: Joi.string().trim().min(1).max(50),
      lastName: Joi.string().trim().min(1).max(50),
      email: Joi.string().email(),
      phoneNumber: Joi.string().trim().allow("", null),
      callingCode: Joi.string().trim().allow("", null),
      address: Joi.string().trim().allow("", null),
    })
    .min(1),
};

const resetUserPassword = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    newPassword: Joi.string()
      .required()
      .min(8)
      .pattern(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .message("Password must be at least 8 characters and contain both letters and numbers"),
  }),
};

module.exports = {
  getAllUsers,
  getUserDetails,
  toggleUserBlock,
  updateKycStatus,
  addUserBalance,
  deductUserBalance,
  deleteUser,
  getRecentActivities,
  updateUserProfile,
  resetUserPassword,
};
