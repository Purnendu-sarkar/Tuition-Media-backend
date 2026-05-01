import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { guardianService } from "./guardian.service.js";
import type { CreateJobInput, UpdateApplicationInput } from "./guardian.validation.js";

async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const guardianId = req.user?.sub;
    
    if (!guardianId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const data = await guardianService.getDashboardStats(guardianId);
    res.status(StatusCodes.OK).json(data);
  } catch (error) {
    next(error);
  }
}

async function createJob(req: Request, res: Response, next: NextFunction) {
  try {
    const guardianId = req.user?.sub;
    
    if (!guardianId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const payload = req.body as CreateJobInput;
    const job = await guardianService.createJob(guardianId, payload);
    
    res.status(StatusCodes.CREATED).json(job);
  } catch (error) {
    next(error);
  }
}

async function getApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const guardianId = req.user?.sub;
    
    if (!guardianId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const jobId = req.params.jobId as string;
    const applications = await guardianService.getJobApplications(guardianId, jobId);
    
    res.status(StatusCodes.OK).json(applications);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: error.message });
    }
    next(error);
  }
}

async function updateApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const guardianId = req.user?.sub;
    
    if (!guardianId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const applicationId = req.params.applicationId as string;
    const payload = req.body as UpdateApplicationInput;
    
    const updatedApplication = await guardianService.updateApplicationStatus(guardianId, applicationId, payload);
    
    res.status(StatusCodes.OK).json(updatedApplication);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: error.message });
    }
    next(error);
  }
}

async function getAllJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const guardianId = req.user?.sub;
    
    if (!guardianId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const jobs = await guardianService.getAllJobs(guardianId);
    
    res.status(StatusCodes.OK).json(jobs);
  } catch (error) {
    next(error);
  }
}

export const guardianController = {
  getDashboard,
  createJob,
  getAllJobs,
  getApplications,
  updateApplication,
};
