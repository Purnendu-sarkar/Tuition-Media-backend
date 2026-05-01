import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { verificationService } from "./verification.service.js";

async function submitVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const doc = await verificationService.submitVerification(userId, req.body);
    res.status(StatusCodes.CREATED).json(doc);
  } catch (error: any) {
    if (error.message.includes("already")) {
      res.status(StatusCodes.CONFLICT).json({ message: error.message });
      return;
    }
    next(error);
  }
}

async function getMyVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;
    const doc = await verificationService.getMyVerification(userId);
    res.status(StatusCodes.OK).json({ verification: doc });
  } catch (error) {
    next(error);
  }
}

async function getPendingVerifications(req: Request, res: Response, next: NextFunction) {
  try {
    // Only ADMIN should access this. Checked by requireRole middleware
    const pending = await verificationService.getPendingVerifications();
    res.status(StatusCodes.OK).json({ pending });
  } catch (error) {
    next(error);
  }
}

async function reviewVerification(req: Request, res: Response, next: NextFunction) {
  try {
    const docId = req.params.id as string;
    const doc = await verificationService.reviewVerification(docId, req.body);
    res.status(StatusCodes.OK).json({ message: "Verification reviewed successfully", doc });
  } catch (error) {
    next(error);
  }
}

export const verificationController = {
  submitVerification,
  getMyVerification,
  getPendingVerifications,
  reviewVerification,
};
