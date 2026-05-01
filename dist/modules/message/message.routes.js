import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";
import { messageController } from "./message.controller.js";
export const messageRouter = Router();
messageRouter.use(requireAuth);
messageRouter.get("/conversations", messageController.getMyConversations);
messageRouter.post("/initiate", messageController.initiateConversation);
messageRouter.get("/:id", messageController.getConversation);
