import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

import { jobService } from "./job.service.js";
import type { ApplyJobInput } from "./job.validation.js";

async function getAllJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const jobs = await jobService.getAllOpenJobs();
    res.status(StatusCodes.OK).json(jobs);
  } catch (error) {
    next(error);
  }
}

async function getJob(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const job = await jobService.getJobById(id);
    res.status(StatusCodes.OK).json(job);
  } catch (error) {
    next(error);
  }
}

async function applyJob(req: Request, res: Response, next: NextFunction) {
  try {
    const tutorId = req.user?.sub;
    
    if (!tutorId || req.user?.role !== "TUTOR") {
      return res.status(StatusCodes.FORBIDDEN).json({ message: "Only tutors can apply for jobs" });
    }

    const id = req.params.id as string;
    const payload = req.body as ApplyJobInput;
    
    const application = await jobService.applyForJob(tutorId, id, payload);
    
    res.status(StatusCodes.CREATED).json(application);
  } catch (error) {
    // If it's an application conflict (already applied) or job not open
    if (error instanceof Error && 
       (error.message.includes("already applied") || error.message.includes("not longer open"))) {
      return res.status(StatusCodes.CONFLICT).json({ message: error.message });
    }
    next(error);
  }
}

async function getAppliedJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const tutorId = req.user?.sub;
    
    if (!tutorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
    }

    const jobIds = await jobService.getAppliedJobsByTutor(tutorId);
    res.status(StatusCodes.OK).json(jobIds);
  } catch (error) {
    next(error);
  }
}

export const jobController = {
  getAllJobs,
  getJob,
  applyJob,
  getAppliedJobs,
};
