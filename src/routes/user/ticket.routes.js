// src/routes/ticket.routes.js
const express = require("express");
const router = express.Router();
const ticketController = require("../../controllers/ticket.controller");
const { authenticate, validateUserEmail } = require("../../middleware/auth.middleware");

// create ticket (employees/managers/admin)
router.post("/", authenticate, validateUserEmail, ticketController.createTicket);

// list tickets for requester
router.get("/", authenticate, validateUserEmail, ticketController.getTickets);

// single ticket ops
router.post("/:id/comment", authenticate, validateUserEmail, ticketController.addComment);
router.patch("/:id/assign", authenticate, validateUserEmail, ticketController.assignTicket);

module.exports = router;
