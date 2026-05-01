import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma.js";

interface ServerToClientEvents {
  new_message: (message: any) => void;
  error: (err: { message: string }) => void;
}

interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  send_message: (data: { conversationId: string; content: string; senderId: string }) => void;
}

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific conversation room
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Handle incoming messages
    socket.on("send_message", async (data) => {
      try {
        const { conversationId, content, senderId } = data;

        // Verify conversation exists
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId }
        });

        if (!conversation) {
          socket.emit("error", { message: "Conversation not found" });
          return;
        }

        // Save message to database
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId,
            content,
          },
          include: {
            sender: {
              select: { id: true, name: true, image: true }
            }
          }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        });

        // Broadcast to everyone in the room (including sender to confirm delivery)
        io.to(conversationId).emit("new_message", message);
      } catch (error) {
        console.error("Socket send_message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
