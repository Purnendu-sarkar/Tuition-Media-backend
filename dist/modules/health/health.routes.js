import { Router } from "express";
import { prisma } from "../../lib/prisma.js";
export const healthRouter = Router();
healthRouter.get("/", async (_request, response) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        response.json({
            success: true,
            message: "Backend and database are healthy.",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    }
    catch {
        response.status(503).json({
            success: false,
            message: "Backend is running but database connection failed.",
            database: "disconnected",
            timestamp: new Date().toISOString(),
        });
    }
});
