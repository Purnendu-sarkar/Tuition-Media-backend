import { z } from "zod";

export const applyJobSchema = z.object({
  body: z.object({
    coverLetter: z.string().optional(),
  }),
});

export type ApplyJobInput = z.infer<typeof applyJobSchema>["body"];
