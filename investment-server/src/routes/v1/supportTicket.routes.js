const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { supportTicketValidation } = require("../../validations");
const { supportTicketController } = require("../../controllers");

const router = express.Router();

// User routes
router.post("/", auth("getUsers"), validate(supportTicketValidation.createTicket), supportTicketController.createTicket);
router.get("/my", auth("getUsers"), validate(supportTicketValidation.getMyTickets), supportTicketController.getMyTickets);
router.get("/:ticketId", auth("getUsers"), validate(supportTicketValidation.getTicket), supportTicketController.getTicket);
router.post("/:ticketId/reply", auth("getUsers"), validate(supportTicketValidation.addReply), supportTicketController.addReply);
router.post("/:ticketId/rate", auth("getUsers"), validate(supportTicketValidation.rateTicket), supportTicketController.rateTicket);

// Admin routes
router.get("/admin/all", auth("manageUsers"), validate(supportTicketValidation.getAllTickets), supportTicketController.getAllTickets);
router.get("/admin/stats", auth("manageUsers"), supportTicketController.getTicketStats);
router.patch("/admin/:ticketId/status", auth("manageUsers"), validate(supportTicketValidation.updateTicketStatus), supportTicketController.updateTicketStatus);
router.post("/admin/:ticketId/assign", auth("manageUsers"), validate(supportTicketValidation.assignTicket), supportTicketController.assignTicket);

module.exports = router;
