import { prisma } from "../../lib/prisma.js";
import { aiService } from "../ai/ai.service.js";
async function submitVerification(userId, data) {
    // Check if a document already exists and is pending or approved
    const existing = await prisma.verificationDocument.findUnique({
        where: { userId }
    });
    if (existing) {
        if (existing.status === "APPROVED") {
            throw new Error("You are already verified.");
        }
        if (existing.status === "PENDING") {
            throw new Error("Your verification is already under review.");
        }
    }
    // Generate AI Risk Score (mock OCR & Face matching)
    const riskScore = await aiService.analyzeVerificationRisk(data.idPhotoUrl, data.facePhotoUrl);
    // Store in DB
    const doc = await prisma.verificationDocument.upsert({
        where: { userId },
        update: {
            idPhotoUrl: data.idPhotoUrl,
            facePhotoUrl: data.facePhotoUrl,
            aiRiskScore: riskScore,
            status: "PENDING",
            adminComments: null,
        },
        create: {
            userId,
            idPhotoUrl: data.idPhotoUrl,
            facePhotoUrl: data.facePhotoUrl,
            aiRiskScore: riskScore,
            status: "PENDING",
        }
    });
    return doc;
}
async function getMyVerification(userId) {
    return prisma.verificationDocument.findUnique({
        where: { userId }
    });
}
// ADMIN FUNCTIONS
async function getPendingVerifications() {
    return prisma.verificationDocument.findMany({
        where: { status: "PENDING" },
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true, image: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}
async function reviewVerification(id, data) {
    const doc = await prisma.verificationDocument.update({
        where: { id },
        data: {
            status: data.status,
            adminComments: data.adminComments
        }
    });
    // If approved, verify the user
    if (data.status === "APPROVED") {
        await prisma.user.update({
            where: { id: doc.userId },
            data: { isVerified: true }
        });
    }
    return doc;
}
export const verificationService = {
    submitVerification,
    getMyVerification,
    getPendingVerifications,
    reviewVerification,
};
