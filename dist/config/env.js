import { config } from "dotenv";
import { z } from "zod";
config();
const envSchema = z.object({
    PORT: z.coerce.number().default(5000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    FRONTEND_URL: z.string().url(),
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16, "JWT_SECRET should be at least 16 characters."),
    JWT_EXPIRES_IN: z.string().default("7d"),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("Invalid backend environment variables", parsedEnv.error.flatten().fieldErrors);
    throw new Error("Invalid backend environment variables.");
}
export const env = parsedEnv.data;
