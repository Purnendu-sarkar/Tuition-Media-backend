import { StatusCodes } from "http-status-codes";
import { guardianService } from "./guardian.service.js";
async function getDashboard(req, res, next) {
    try {
        const guardianId = req.user?.sub;
        if (!guardianId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }
        const data = await guardianService.getDashboardStats(guardianId);
        res.status(StatusCodes.OK).json(data);
    }
    catch (error) {
        next(error);
    }
}
async function createJob(req, res, next) {
    try {
        const guardianId = req.user?.sub;
        if (!guardianId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }
        const payload = req.body;
        const job = await guardianService.createJob(guardianId, payload);
        res.status(StatusCodes.CREATED).json(job);
    }
    catch (error) {
        next(error);
    }
}
async function getApplications(req, res, next) {
    try {
        const guardianId = req.user?.sub;
        if (!guardianId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }
        const jobId = req.params.jobId;
        const applications = await guardianService.getJobApplications(guardianId, jobId);
        res.status(StatusCodes.OK).json(applications);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: error.message });
        }
        next(error);
    }
}
async function updateApplication(req, res, next) {
    try {
        const guardianId = req.user?.sub;
        if (!guardianId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }
        const applicationId = req.params.applicationId;
        const payload = req.body;
        const updatedApplication = await guardianService.updateApplicationStatus(guardianId, applicationId, payload);
        res.status(StatusCodes.OK).json(updatedApplication);
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("Unauthorized")) {
            return res.status(StatusCodes.FORBIDDEN).json({ message: error.message });
        }
        next(error);
    }
}
async function getAllJobs(req, res, next) {
    try {
        const guardianId = req.user?.sub;
        if (!guardianId)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        const jobs = await guardianService.getAllJobs(guardianId);
        res.status(StatusCodes.OK).json(jobs);
    }
    catch (error) {
        next(error);
    }
}
async function checkIfSaved(req, res, next) {
    try {
        const guardianId = req.user?.sub;
        if (!guardianId)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        const tutorId = req.params.tutorId;
        const isSaved = await guardianService.checkIfSaved(guardianId, tutorId);
        res.status(StatusCodes.OK).json({ isSaved });
    }
    catch (error) {
        next(error);
    }
}
async function getSavedTutors(req, res, next) {
    try {
        const guardianId = req.user?.sub;
        if (!guardianId)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        const savedTutors = await guardianService.getSavedTutors(guardianId);
        res.status(StatusCodes.OK).json(savedTutors);
    }
    catch (error) {
        next(error);
    }
}
async function saveTutor(req, res, next) {
    try {
        const guardianId = req.user?.sub;
        if (!guardianId)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        const tutorId = req.params.tutorId;
        const saved = await guardianService.saveTutor(guardianId, tutorId);
        res.status(StatusCodes.CREATED).json(saved);
    }
    catch (error) {
        next(error);
    }
}
async function unsaveTutor(req, res, next) {
    try {
        const guardianId = req.user?.sub;
        if (!guardianId)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        const tutorId = req.params.tutorId;
        await guardianService.unsaveTutor(guardianId, tutorId);
        res.status(StatusCodes.NO_CONTENT).send();
    }
    catch (error) {
        next(error);
    }
}
export const guardianController = {
    getDashboard,
    createJob,
    getAllJobs,
    getApplications,
    updateApplication,
    getSavedTutors,
    saveTutor,
    unsaveTutor,
    checkIfSaved,
};
