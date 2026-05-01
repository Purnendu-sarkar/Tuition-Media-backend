import { prisma } from "../../lib/prisma.js";

async function getMyConversations(userId: string) {
  return prisma.conversation.findMany({
    where: {
      OR: [
        { participantOneId: userId },
        { participantTwoId: userId }
      ]
    },
    include: {
      participantOne: { select: { id: true, name: true, image: true, role: true } },
      participantTwo: { select: { id: true, name: true, image: true, role: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

async function getConversation(conversationId: string, userId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participantOne: { select: { id: true, name: true, image: true, role: true } },
      participantTwo: { select: { id: true, name: true, image: true, role: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: { select: { id: true, name: true, image: true } }
        }
      }
    }
  });

  if (!conv || (conv.participantOneId !== userId && conv.participantTwoId !== userId)) {
    throw new Error("Conversation not found or unauthorized");
  }

  // Mark unread messages as read
  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      isRead: false
    },
    data: { isRead: true }
  });

  return conv;
}

async function getOrCreateConversation(userId: string, targetUserId: string) {
  if (userId === targetUserId) {
    throw new Error("Cannot create conversation with yourself");
  }

  // Try to find existing
  let conv = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participantOneId: userId, participantTwoId: targetUserId },
        { participantOneId: targetUserId, participantTwoId: userId }
      ]
    }
  });

  if (!conv) {
    // Check if target user exists
    const target = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!target) throw new Error("Target user not found");

    conv = await prisma.conversation.create({
      data: {
        participantOneId: userId,
        participantTwoId: targetUserId
      }
    });
  }

  return conv;
}

export const messageService = {
  getMyConversations,
  getConversation,
  getOrCreateConversation
};
