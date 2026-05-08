import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { z } from "zod";

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  revieweeId: z.string(),
  jobId: z.string().optional(),
});

async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const reviewerId = (req as any).user.sub;
    const { rating, comment, revieweeId, jobId } = createReviewSchema.parse(req.body);

    // Check if review already exists for this job if jobId is provided
    if (jobId) {
      const existing = await prisma.review.findFirst({
        where: { jobId, reviewerId }
      });
      if (existing) {
        res.status(StatusCodes.CONFLICT).json({ message: "You have already reviewed this tuition" });
        return;
      }
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        reviewerId,
        revieweeId,
        jobId,
      }
    });

    res.status(StatusCodes.CREATED).json(review);
  } catch (error) {
    next(error);
  }
}

export const reviewController = {
  createReview,
};
