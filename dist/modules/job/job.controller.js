import { StatusCodes } from "http-status-codes";
import { jobService } from "./job.service.js";
async function getAllJobs(req, res, next) {
    try {
        const tutorId = req.user?.sub;
        const jobs = await jobService.getAllOpenJobs(tutorId);
        res.status(StatusCodes.OK).json(jobs);
    }
    catch (error) {
        next(error);
    }
}
async function getJob(req, res, next) {
    try {
        const id = req.params.id;
        const job = await jobService.getJobById(id);
        res.status(StatusCodes.OK).json(job);
    }
    catch (error) {
        next(error);
    }
}
async function applyJob(req, res, next) {
    try {
        const tutorId = req.user?.sub;
        if (!tutorId || req.user?.role !== "TUTOR") {
            return res.status(StatusCodes.FORBIDDEN).json({ message: "Only tutors can apply for jobs" });
        }
        const id = req.params.id;
        const payload = req.body;
        const application = await jobService.applyForJob(tutorId, id, payload);
        res.status(StatusCodes.CREATED).json(application);
    }
    catch (error) {
        // If it's an application conflict (already applied) or job not open
        if (error instanceof Error &&
            (error.message.includes("already applied") || error.message.includes("not longer open"))) {
            return res.status(StatusCodes.CONFLICT).json({ message: error.message });
        }
        next(error);
    }
}
async function getAppliedJobs(req, res, next) {
    try {
        const tutorId = req.user?.sub;
        if (!tutorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }
        const jobIds = await jobService.getAppliedJobsByTutor(tutorId);
        res.status(StatusCodes.OK).json(jobIds);
    }
    catch (error) {
        next(error);
    }
}
async function getMyApplications(req, res, next) {
    try {
        const tutorId = req.user?.sub;
        if (!tutorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }
        const applications = await jobService.getTutorApplications(tutorId);
        res.status(StatusCodes.OK).json(applications);
    }
    catch (error) {
        next(error);
    }
}
export const jobController = {
    getAllJobs,
    getJob,
    applyJob,
    getAppliedJobs,
    getMyApplications,
};
