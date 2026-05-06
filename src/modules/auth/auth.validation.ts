import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.string().trim().email("Provide a valid email address."),
  password: passwordSchema,
  role: z.enum(["TUTOR", "GUARDIAN"]),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Provide a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
});

export const sendOtpSchema = z.object({
  email: z.string().trim().email("Provide a valid email address."),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().email("Provide a valid email address."),
  code: z.string().length(6, "OTP must be 6 digits."),
});
