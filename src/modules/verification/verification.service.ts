import { prisma } from "../../lib/prisma.js";
import { aiService } from "../ai/ai.service.js";
import type { SubmitVerificationInput, ReviewVerificationInput } from "./verification.validation.js";

async function submitVerification(userId: string, data: SubmitVerificationInput & { idLocalPath?: string; faceLocalPath?: string }) {
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

  // Generate AI Risk Score and OCR data
  // Use local path for OCR if available, otherwise fallback to URL
  const aiAnalysis = await aiService.analyzeVerificationRisk(
    data.idLocalPath || data.idPhotoUrl || "", 
    data.faceLocalPath || data.facePhotoUrl || ""
  );

  // Store in DB
  const doc = await prisma.verificationDocument.upsert({
    where: { userId },
    update: {
      idPhotoUrl: data.idPhotoUrl,
      facePhotoUrl: data.facePhotoUrl,
      ipAddress: data.ipAddress,
      deviceFingerprint: data.deviceFingerprint,
      aiRiskScore: aiAnalysis.riskScore,
      extractedData: aiAnalysis.extractedData || undefined,
      ocrConfidence: aiAnalysis.ocrConfidence,
      status: "PENDING",
      adminComments: null,
    },
    create: {
      userId,
      idPhotoUrl: data.idPhotoUrl,
      facePhotoUrl: data.facePhotoUrl,
      ipAddress: data.ipAddress,
      deviceFingerprint: data.deviceFingerprint,
      aiRiskScore: aiAnalysis.riskScore,
      extractedData: aiAnalysis.extractedData || undefined,
      ocrConfidence: aiAnalysis.ocrConfidence,
      status: "PENDING",
    }
  });

  return doc;
}

async function getMyVerification(userId: string) {
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

async function reviewVerification(id: string, data: ReviewVerificationInput) {
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
