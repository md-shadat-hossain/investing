const httpStatus = require("http-status");
const pick = require("../utils/pick");
const catchAsync = require("../utils/catchAsync");
const { supportTicketService, notificationService } = require("../services");
const response = require("../config/response");
const ApiError = require("../utils/ApiError");

// Create ticket
const createTicket = catchAsync(async (req, res) => {
  const ticket = await supportTicketService.createTicket(req.user._id, req.body);

  // Notify admins
  await notificationService.sendToAdmins(
    "New Support Ticket",
    `${req.user.fullName || req.user.email} has opened a new support ticket: ${req.body.subject}`,
    "support",
    { priority: req.body.priority }
  );

  res.status(httpStatus.CREATED).json(
    response({
      message: "Support ticket created successfully",
      status: "OK",
      statusCode: httpStatus.CREATED,
      data: ticket,
    })
  );
});

// Get my tickets
const getMyTickets = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status", "priority", "category"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await supportTicketService.getTicketsByUser(req.user._id, filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "Tickets retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Get ticket by id
const getTicket = catchAsync(async (req, res) => {
  const ticket = await supportTicketService.getTicketById(req.params.ticketId);
  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
  }

  // Check if user owns ticket or is admin
  if (req.user.role === "user" && ticket.user._id.toString() !== req.user._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
  }

  res.status(httpStatus.OK).json(
    response({
      message: "Ticket retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: ticket,
    })
  );
});

// Add reply to ticket
const addReply = catchAsync(async (req, res) => {
  const { message, attachments } = req.body;
  const senderRole = req.user.role;

  const ticket = await supportTicketService.addReply(
    req.params.ticketId,
    req.user._id,
    senderRole,
    message,
    attachments
  );

  // Notify the other party
  if (senderRole === "user") {
    await notificationService.sendToAdmins(
      "Ticket Reply",
      `User replied to ticket #${ticket.ticketId}`,
      "support"
    );
  } else {
    await notificationService.sendToUser(
      ticket.user._id,
      "Ticket Reply",
      `An admin has replied to your support ticket #${ticket.ticketId}`,
      "support"
    );
  }

  res.status(httpStatus.OK).json(
    response({
      message: "Reply added successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: ticket,
    })
  );
});

// Update ticket status (Admin)
const updateTicketStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const ticket = await supportTicketService.updateTicketStatus(
    req.params.ticketId,
    status,
    req.user._id
  );

  // Notify user
  await notificationService.sendToUser(
    ticket.user._id,
    "Ticket Status Updated",
    `Your support ticket #${ticket.ticketId} status has been updated to: ${status}`,
    "support"
  );

  res.status(httpStatus.OK).json(
    response({
      message: "Ticket status updated successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: ticket,
    })
  );
});

// Assign ticket to admin
const assignTicket = catchAsync(async (req, res) => {
  const { adminId } = req.body;
  const ticket = await supportTicketService.assignTicket(req.params.ticketId, adminId);
  res.status(httpStatus.OK).json(
    response({
      message: "Ticket assigned successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: ticket,
    })
  );
});

// Rate ticket
const rateTicket = catchAsync(async (req, res) => {
  const { rating, feedback } = req.body;
  const ticket = await supportTicketService.rateTicket(
    req.params.ticketId,
    req.user._id,
    rating,
    feedback
  );
  res.status(httpStatus.OK).json(
    response({
      message: "Ticket rated successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: ticket,
    })
  );
});

// Admin: Get all tickets
const getAllTickets = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["status", "priority", "category", "assignedTo"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await supportTicketService.queryTickets(filter, options);
  res.status(httpStatus.OK).json(
    response({
      message: "All tickets retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: result,
    })
  );
});

// Admin: Get ticket statistics
const getTicketStats = catchAsync(async (req, res) => {
  const stats = await supportTicketService.getTicketStats();
  res.status(httpStatus.OK).json(
    response({
      message: "Ticket statistics retrieved successfully",
      status: "OK",
      statusCode: httpStatus.OK,
      data: stats,
    })
  );
});

module.exports = {
  createTicket,
  getMyTickets,
  getTicket,
  addReply,
  updateTicketStatus,
  assignTicket,
  rateTicket,
  getAllTickets,
  getTicketStats,
};
