const Joi = require("joi");
const { objectId } = require("./custom.validation");

const getMyNotifications = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(100),
    skip: Joi.number().integer().min(0),
    status: Joi.string().valid("read", "unread"),
  }),
};

const markAsRead = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

const sendToUser = {
  body: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
    title: Joi.string().required().max(100),
    content: Joi.string().required().max(500),
    type: Joi.string().default("system"),
    priority: Joi.string().valid("low", "medium", "high").default("medium"),
  }),
};

const sendToAllUsers = {
  body: Joi.object().keys({
    title: Joi.string().required().max(100),
    content: Joi.string().required().max(500),
    type: Joi.string().default("system"),
    priority: Joi.string().valid("low", "medium", "high").default("medium"),
  }),
};

module.exports = {
  getMyNotifications,
  markAsRead,
  deleteNotification,
  sendToUser,
  sendToAllUsers,
};
