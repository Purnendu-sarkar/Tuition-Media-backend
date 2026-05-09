import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// FAQ Controllers
export const getFaqs = async (req, res) => {
    try {
        const faqs = await prisma.fAQ.findMany();
        res.json(faqs);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch FAQs" });
    }
};
export const createFaq = async (req, res) => {
    try {
        const { question, answer, category } = req.body;
        const faq = await prisma.fAQ.create({
            data: { question, answer, category },
        });
        res.status(201).json(faq);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to create FAQ" });
    }
};
// Report Controllers
export const createReport = async (req, res) => {
    try {
        // @ts-ignore - Assuming req.user is populated by auth middleware
        const reporterId = req.user.sub;
        const { reportedId, reason, description } = req.body;
        // Ensure reportedId is either a valid string or null (not empty string)
        const validReportedId = reportedId?.trim() ? reportedId.trim() : null;
        const report = await prisma.report.create({
            data: { reporterId, reportedId: validReportedId, reason, description },
        });
        res.status(201).json(report);
    }
    catch (error) {
        console.error("Error creating report:", error);
        if (error.code === 'P2003') {
            if (String(error.meta?.field_name || error.message).includes('reportedId')) {
                return res.status(400).json({ message: "The specified User ID to report does not exist." });
            }
            if (String(error.meta?.field_name || error.message).includes('reporterId')) {
                return res.status(401).json({ message: "Your session is invalid. Please sign out and sign in again." });
            }
        }
        res.status(500).json({ message: `Failed to submit report: ${error?.message || String(error)}` });
    }
};
// Support Ticket Controllers
export const createTicket = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.sub;
        const { subject, description } = req.body;
        const ticket = await prisma.supportTicket.create({
            data: { userId, subject, description },
        });
        res.status(201).json(ticket);
    }
    catch (error) {
        console.error("Error creating ticket:", error);
        res.status(500).json({ message: `Failed to create ticket: ${error?.message || String(error)}` });
    }
};
export const getUserTickets = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.user.sub;
        const tickets = await prisma.supportTicket.findMany({
            where: { userId },
            include: { messages: true },
        });
        res.json(tickets);
    }
    catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ message: `Failed to fetch tickets: ${error?.message || String(error)}` });
    }
};
export const addTicketMessage = async (req, res) => {
    try {
        // @ts-ignore
        const senderId = req.user.sub;
        const { ticketId } = req.params;
        const { content } = req.body;
        const message = await prisma.ticketMessage.create({
            data: { ticketId: ticketId, senderId, content: content },
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error("Error adding message:", error);
        res.status(500).json({ message: `Failed to send message: ${error?.message || String(error)}` });
    }
};
