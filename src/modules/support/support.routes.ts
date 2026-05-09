import { Router } from "express";
import { getFaqs, createFaq, createReport, createTicket, getUserTickets, addTicketMessage } from "./support.controller.js";
import { requireAuth } from "../../middlewares/require-auth.js";

export const supportRouter = Router();

// FAQ Routes
supportRouter.get("/faqs", getFaqs);
supportRouter.post("/faqs", requireAuth, createFaq); // Could restrict to ADMIN later

// Report Routes
supportRouter.post("/reports", requireAuth, createReport);

// Ticket Routes
supportRouter.post("/tickets", requireAuth, createTicket);
supportRouter.get("/tickets", requireAuth, getUserTickets);
supportRouter.post("/tickets/:ticketId/messages", requireAuth, addTicketMessage);
