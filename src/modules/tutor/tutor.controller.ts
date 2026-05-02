import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { tutorService } from "./tutor.service.js";

async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const tutorId = req.user?.sub;
    
    if (!tutorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const data = await tutorService.getDashboardStats(tutorId);
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
}

async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const tutorId = req.user?.sub;
    if (!tutorId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });

    const profile = await tutorService.getProfile(tutorId);
    res.status(StatusCodes.OK).json(profile);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const tutorId = req.user?.sub;
    if (!tutorId) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });

    const profile = await tutorService.updateProfile(tutorId, req.body);
    res.status(StatusCodes.OK).json(profile);
  } catch (error) {
    next(error);
  }
}

export const tutorController = {
  getDashboard,
  getProfile,
  updateProfile,
};
