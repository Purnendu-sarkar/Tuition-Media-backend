import { StatusCodes } from "http-status-codes";
import { messageService } from "./message.service.js";
async function getMyConversations(req, res, next) {
    try {
        const userId = req.user.sub;
        const conversations = await messageService.getMyConversations(userId);
        res.status(StatusCodes.OK).json({ conversations });
    }
    catch (error) {
        next(error);
    }
}
async function getConversation(req, res, next) {
    try {
        const userId = req.user.sub;
        const conversationId = req.params.id;
        const conversation = await messageService.getConversation(conversationId, userId);
        res.status(StatusCodes.OK).json({ conversation });
    }
    catch (error) {
        next(error);
    }
}
async function initiateConversation(req, res, next) {
    try {
        const userId = req.user.sub;
        const { targetUserId } = req.body;
        if (!targetUserId || typeof targetUserId !== 'string') {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "targetUserId is required" });
        }
        const conversation = await messageService.getOrCreateConversation(userId, targetUserId);
        res.status(StatusCodes.OK).json({ conversation });
    }
    catch (error) {
        next(error);
    }
}
export const messageController = {
    getMyConversations,
    getConversation,
    initiateConversation
};
