import { z } from "zod";
export const createJobSchema = z.object({
    body: z.object({
        title: z.string().min(5, "Title must be at least 5 characters long").max(100),
        description: z.string().min(20, "Description must be at least 20 characters long"),
        budget: z.number().positive("Budget must be a positive number").optional().nullable(),
        location: z.string().min(3, "Location is required").optional().nullable(),
    }),
});
export const updateApplicationSchema = z.object({
    body: z.object({
        status: z.enum(["ACCEPTED", "REJECTED"]),
    }),
});
