const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createTicket = {
  body: Joi.object().keys({
    subject: Joi.string().required().trim().max(200),
    category: Joi.string().valid("deposit", "withdrawal", "investment", "account", "technical", "other").default("other"),
    priority: Joi.string().valid("low", "normal", "high", "urgent").default("normal"),
    message: Joi.string().required().min(10).max(2000),
  }),
};

const getMyTickets = {
  query: Joi.object().keys({
    status: Joi.string().valid("open", "in_progress", "waiting_reply", "resolved", "closed"),
    priority: Joi.string().valid("low", "normal", "high", "urgent"),
    category: Joi.string().valid("deposit", "withdrawal", "investment", "account", "technical", "other"),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId),
  }),
};

const addReply = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    message: Joi.string().required().min(1).max(2000),
    attachments: Joi.array().items(Joi.string()),
  }),
};

const updateTicketStatus = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid("open", "in_progress", "waiting_reply", "resolved", "closed").required(),
  }),
};

const assignTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    adminId: Joi.string().custom(objectId).required(),
  }),
};

const rateTicket = {
  params: Joi.object().keys({
    ticketId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    rating: Joi.number().required().min(1).max(5),
    feedback: Joi.string().allow("", null).max(500),
  }),
};

const getAllTickets = {
  query: Joi.object().keys({
    status: Joi.string().valid("open", "in_progress", "waiting_reply", "resolved", "closed"),
    priority: Joi.string().valid("low", "normal", "high", "urgent"),
    category: Joi.string().valid("deposit", "withdrawal", "investment", "account", "technical", "other"),
    assignedTo: Joi.string().custom(objectId),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createTicket,
  getMyTickets,
  getTicket,
  addReply,
  updateTicketStatus,
  assignTicket,
  rateTicket,
  getAllTickets,
};
