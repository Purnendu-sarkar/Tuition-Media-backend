import { StatusCodes } from "http-status-codes";
import { tutorService } from "./tutor.service.js";
async function getDashboard(req, res, next) {
    try {
        const tutorId = req.user?.sub;
        if (!tutorId) {
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        }
        const data = await tutorService.getDashboardStats(tutorId);
        res.status(StatusCodes.OK).json(data);
    }
    catch (error) {
        next(error);
    }
}
async function getProfile(req, res, next) {
    try {
        const tutorId = req.user?.sub;
        if (!tutorId)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        const profile = await tutorService.getProfile(tutorId);
        res.status(StatusCodes.OK).json(profile);
    }
    catch (error) {
        next(error);
    }
}
async function updateProfile(req, res, next) {
    try {
        const tutorId = req.user?.sub;
        if (!tutorId)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        const profile = await tutorService.updateProfile(tutorId, req.body);
        res.status(StatusCodes.OK).json(profile);
    }
    catch (error) {
        next(error);
    }
}
async function getAvailability(req, res, next) {
    try {
        const tutorId = req.user?.sub;
        if (!tutorId)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        const availability = await tutorService.getAvailability(tutorId);
        res.status(StatusCodes.OK).json(availability);
    }
    catch (error) {
        next(error);
    }
}
async function updateAvailability(req, res, next) {
    try {
        const tutorId = req.user?.sub;
        if (!tutorId)
            return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized" });
        const availability = await tutorService.updateAvailability(tutorId, req.body.availabilities);
        res.status(StatusCodes.OK).json(availability);
    }
    catch (error) {
        next(error);
    }
}
export const tutorController = {
    getDashboard,
    getProfile,
    updateProfile,
    getAvailability,
    updateAvailability,
};
