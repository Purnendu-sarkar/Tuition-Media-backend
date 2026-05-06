import { StatusCodes } from "http-status-codes";
import { adminService } from "./admin.service.js";
async function getStats(req, res, next) {
    try {
        const stats = await adminService.getPlatformStats();
        res.status(StatusCodes.OK).json(stats);
    }
    catch (error) {
        next(error);
    }
}
async function getUsers(req, res, next) {
    try {
        const role = req.query.role;
        const users = await adminService.getAllUsers(role);
        res.status(StatusCodes.OK).json({ users });
    }
    catch (error) {
        next(error);
    }
}
async function deleteUser(req, res, next) {
    try {
        const userId = req.params.id;
        await adminService.deleteUser(userId);
        res.status(StatusCodes.OK).json({ message: "User deleted successfully" });
    }
    catch (error) {
        next(error);
    }
}
async function getJobs(req, res, next) {
    try {
        const jobs = await adminService.getAllJobs();
        res.status(StatusCodes.OK).json({ jobs });
    }
    catch (error) {
        next(error);
    }
}
async function deleteJob(req, res, next) {
    try {
        const jobId = req.params.id;
        await adminService.deleteJob(jobId);
        res.status(StatusCodes.OK).json({ message: "Job deleted successfully" });
    }
    catch (error) {
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
