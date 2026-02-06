const httpStatus = require("http-status");
const { SupportTicket } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a support ticket
 * @param {ObjectId} userId
 * @param {Object} ticketData
 * @returns {Promise<SupportTicket>}
 */
const createTicket = async (userId, ticketData) => {
  const { subject, category, priority, message } = ticketData;

  const ticket = await SupportTicket.create({
    user: userId,
    subject,
    category,
    priority,
    messages: [
      {
        sender: userId,
        senderRole: "user",
        message,
      },
    ],
  });

  return ticket;
};

/**
 * Get tickets by user
 * @param {ObjectId} userId
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const getTicketsByUser = async (userId, filter = {}, options = {}) => {
  return SupportTicket.paginate(
    { user: userId, ...filter },
    { ...options, sort: { createdAt: -1 } }
  );
};

/**
 * Get ticket by id
 * @param {ObjectId} id
 * @returns {Promise<SupportTicket>}
 */
const getTicketById = async (id) => {
  return SupportTicket.findById(id)
    .populate("user", "fullName email image")
    .populate("assignedTo", "fullName email")
    .populate("messages.sender", "fullName email image");
};

/**
 * Add reply to ticket
 * @param {ObjectId} ticketId
 * @param {ObjectId} senderId
 * @param {string} senderRole
 * @param {string} message
 * @param {string[]} attachments
 * @returns {Promise<SupportTicket>}
 */
const addReply = async (ticketId, senderId, senderRole, message, attachments = []) => {
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
  }

  if (ticket.status === "closed") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Cannot reply to a closed ticket");
  }

  ticket.messages.push({
    sender: senderId,
    senderRole,
    message,
    attachments,
  });

  // Update status based on who replied
  if (senderRole === "user") {
    ticket.status = "waiting_reply";
  } else {
    ticket.status = "in_progress";
  }

  await ticket.save();
  return ticket;
};

/**
 * Update ticket status
 * @param {ObjectId} ticketId
 * @param {string} status
 * @param {ObjectId} adminId
 * @returns {Promise<SupportTicket>}
 */
const updateTicketStatus = async (ticketId, status, adminId = null) => {
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
  }

  ticket.status = status;

  if (status === "resolved") {
    ticket.resolvedAt = new Date();
  } else if (status === "closed") {
    ticket.closedAt = new Date();
  }

  if (adminId && !ticket.assignedTo) {
    ticket.assignedTo = adminId;
  }

  await ticket.save();
  return ticket;
};

/**
 * Assign ticket to admin
 * @param {ObjectId} ticketId
 * @param {ObjectId} adminId
 * @returns {Promise<SupportTicket>}
 */
const assignTicket = async (ticketId, adminId) => {
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
  }

  ticket.assignedTo = adminId;
  ticket.status = "in_progress";
  await ticket.save();
  return ticket;
};

/**
 * Rate ticket
 * @param {ObjectId} ticketId
 * @param {ObjectId} userId
 * @param {number} rating
 * @param {string} feedback
 * @returns {Promise<SupportTicket>}
 */
const rateTicket = async (ticketId, userId, rating, feedback = null) => {
  const ticket = await getTicketById(ticketId);

  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
  }

  if (ticket.user._id.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, "You can only rate your own tickets");
  }

  if (!["resolved", "closed"].includes(ticket.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Can only rate resolved or closed tickets");
  }

  ticket.rating = rating;
  ticket.feedback = feedback;
  await ticket.save();
  return ticket;
};

/**
 * Query all tickets (admin)
 * @param {Object} filter
 * @param {Object} options
 * @returns {Promise<QueryResult>}
 */
const queryTickets = async (filter, options) => {
  return SupportTicket.paginate(filter, {
    ...options,
    populate: "user assignedTo",
    sort: { createdAt: -1 },
  });
};

/**
 * Get ticket statistics (admin)
 * @returns {Promise<Object>}
 */
const getTicketStats = async () => {
  const stats = await SupportTicket.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const avgRating = await SupportTicket.aggregate([
    { $match: { rating: { $ne: null } } },
    { $group: { _id: null, avgRating: { $avg: "$rating" } } },
  ]);

  return {
    byStatus: stats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    averageRating: avgRating[0]?.avgRating || 0,
  };
};

module.exports = {
  createTicket,
  getTicketsByUser,
  getTicketById,
  addReply,
  updateTicketStatus,
  assignTicket,
  rateTicket,
  queryTickets,
  getTicketStats,
};
