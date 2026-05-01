import { z } from "zod";
export const applyJobSchema = z.object({
    body: z.object({
        coverLetter: z.string().optional(),
    }),
});
