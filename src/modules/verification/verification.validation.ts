import { z } from "zod";

export const submitVerificationSchema = z.object({
  body: z.object({
    idPhotoUrl: z.string().optional(),
    facePhotoUrl: z.string().optional(),
    ipAddress: z.string().optional(),
    deviceFingerprint: z.string().optional(),
  }),
});

export const reviewVerificationSchema = z.object({
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"]),
    adminComments: z.string().optional(),
  }),
});

export type SubmitVerificationInput = z.infer<typeof submitVerificationSchema>["body"];
export type ReviewVerificationInput = z.infer<typeof reviewVerificationSchema>["body"];
