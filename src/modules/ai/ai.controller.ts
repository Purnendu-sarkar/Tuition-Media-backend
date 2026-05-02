import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { aiService } from "./ai.service.js";
import { prisma } from "../../lib/prisma.js";

async function generateJob(req: Request, res: Response, next: NextFunction) {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Prompt is required" });
    }

    const generatedData = await aiService.generateJobDescription(prompt);
    
    res.status(StatusCodes.OK).json(generatedData);
  } catch (error) {
    next(error);
  }
}

async function generateCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.body;
    const userId = req.user?.sub;

    if (!jobId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Job ID is required" });
    }

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    // Get Job Details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { title: true, description: true }
    });

    if (!job) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "Job not found" });
    }

    // Get Tutor Details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        name: true, 
        tutorProfile: {
          select: { bio: true }
        }
      }
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    const coverLetter = await aiService.generateCoverLetter(
      job.title,
      job.description,
      user.name,
      user.tutorProfile?.bio || undefined
    );
    
    res.status(StatusCodes.OK).json({ coverLetter });
  } catch (error) {
    next(error);
  }
}

async function optimizeBio(req: Request, res: Response, next: NextFunction) {
  try {
    const { bio } = req.body;
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    const optimizedBio = await aiService.optimizeTutorBio(bio || "", user.name);
    
    res.status(StatusCodes.OK).json({ optimizedBio });
  } catch (error) {
    next(error);
  }
}

export const aiController = {
  generateJob,
  generateCoverLetter,
  optimizeBio,
};
