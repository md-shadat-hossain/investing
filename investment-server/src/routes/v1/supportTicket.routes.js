const express = require("express");
const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const { supportTicketValidation } = require("../../validations");
const { supportTicketController } = require("../../controllers");

const router = express.Router();

// User routes
router.post("/", auth("common"), validate(supportTicketValidation.createTicket), supportTicketController.createTicket);
router.get("/my", auth("common"), validate(supportTicketValidation.getMyTickets), supportTicketController.getMyTickets);
router.get("/:ticketId", auth("common"), validate(supportTicketValidation.getTicket), supportTicketController.getTicket);
router.post("/:ticketId/reply", auth("common"), validate(supportTicketValidation.addReply), supportTicketController.addReply);
router.post("/:ticketId/rate", auth("common"), validate(supportTicketValidation.rateTicket), supportTicketController.rateTicket);

// Admin routes
router.get("/admin/all", auth("commonAdmin"), validate(supportTicketValidation.getAllTickets), supportTicketController.getAllTickets);
router.get("/admin/stats", auth("commonAdmin"), supportTicketController.getTicketStats);
router.patch("/admin/:ticketId/status", auth("commonAdmin"), validate(supportTicketValidation.updateTicketStatus), supportTicketController.updateTicketStatus);
router.post("/admin/:ticketId/assign", auth("commonAdmin"), validate(supportTicketValidation.assignTicket), supportTicketController.assignTicket);

module.exports = router;
