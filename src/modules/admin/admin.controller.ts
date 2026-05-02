import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { adminService } from "./admin.service.js";

async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminService.getPlatformStats();
    res.status(StatusCodes.OK).json(stats);
  } catch (error) {
    next(error);
  }
}

async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.query.role as string;
    const users = await adminService.getAllUsers(role);
    res.status(StatusCodes.OK).json({ users });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.id as string;
    await adminService.deleteUser(userId);
    res.status(StatusCodes.OK).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
}

async function getJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const jobs = await adminService.getAllJobs();
    res.status(StatusCodes.OK).json({ jobs });
  } catch (error) {
    next(error);
  }
}

async function deleteJob(req: Request, res: Response, next: NextFunction) {
  try {
    const jobId = req.params.id as string;
    await adminService.deleteJob(jobId);
    res.status(StatusCodes.OK).json({ message: "Job deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export const adminController = {
  getStats,
  getUsers,
  deleteUser,
  getJobs,
  deleteJob,
};
