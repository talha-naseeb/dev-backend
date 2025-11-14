const express = require("express");
const router = express.Router();
const { createTicket, getTickets, addComment, assignTicket } = require("../../controllers/ticket.controller");
const { authenticate, validateUserEmail } = require("../../middleware/auth.middleware");

// create ticket (employees/managers/admin)
router.post("/", authenticate, validateUserEmail, createTicket);

// list tickets for requester
router.get("/", authenticate, validateUserEmail, getTickets);

// single ticket ops
router.post("/:id/comment", authenticate, validateUserEmail, addComment);
router.patch("/:id/assign", authenticate, validateUserEmail, assignTicket);

module.exports = router;
