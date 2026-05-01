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

export const tutorController = {
  getDashboard,
};
