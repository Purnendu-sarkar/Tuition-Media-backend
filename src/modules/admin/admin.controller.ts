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

// Support & Moderation
async function getReports(req: Request, res: Response, next: NextFunction) {
  try {
    const reports = await adminService.getAllReports();
    res.status(StatusCodes.OK).json({ reports });
  } catch (error) {
    next(error);
  }
}

async function updateReportStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const report = await adminService.updateReportStatus(id as string, status as any);
    res.status(StatusCodes.OK).json({ report });
  } catch (error) {
    next(error);
  }
}

async function getTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const tickets = await adminService.getAllTickets();
    res.status(StatusCodes.OK).json({ tickets });
  } catch (error) {
    next(error);
  }
}

async function updateTicketStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const ticket = await adminService.updateTicketStatus(id as string, status as any);
    res.status(StatusCodes.OK).json({ ticket });
  } catch (error) {
    next(error);
  }
}

async function addTicketMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { content } = req.body;
    // @ts-ignore
    const adminId = req.user.sub;
    const message = await adminService.addTicketMessage(id as string, adminId, content as string);
    res.status(StatusCodes.CREATED).json({ message });
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
  getReports,
  updateReportStatus,
  getTickets,
  updateTicketStatus,
  addTicketMessage,
};
