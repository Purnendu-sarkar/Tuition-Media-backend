import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { sendEmail } from "../../lib/email.js";
import { AppError } from "../../lib/app-error.js";
import otpGenerator from "otp-generator";

async function sendOtp(email: string) {
  // Generate a 6-digit numeric OTP
  const code = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

  // Save/Update in DB
  await prisma.otpCode.upsert({
    where: { email: email.toLowerCase() },
    update: { code, expiresAt, createdAt: new Date() },
    create: { email: email.toLowerCase(), code, expiresAt },
  });

  // Send email
  await sendEmail({
    to: email,
    subject: "Your OTP Verification Code",
    text: `Your verification code is: ${code}. It will expire in 10 minutes.`,
    html: `<p>Your verification code is: <strong>${code}</strong></p><p>It will expire in 10 minutes.</p>`,
  });

  return { message: "OTP sent successfully" };
}

async function verifyOtp(email: string, code: string) {
  const otpRecord = await prisma.otpCode.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!otpRecord) {
    throw new AppError(StatusCodes.NOT_FOUND, "OTP not found");
  }

  if (otpRecord.code !== code) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid OTP");
  }

  if (otpRecord.expiresAt < new Date()) {
    throw new AppError(StatusCodes.BAD_REQUEST, "OTP has expired");
  }

  // Delete after successful verification
  await prisma.otpCode.delete({
    where: { email: email.toLowerCase() },
  });

  return { message: "OTP verified successfully" };
}

export const otpService = {
  sendOtp,
  verifyOtp,
};
