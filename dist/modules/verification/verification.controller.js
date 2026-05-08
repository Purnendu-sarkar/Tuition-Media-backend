import { StatusCodes } from "http-status-codes";
import { verificationService } from "./verification.service.js";
async function submitVerification(req, res, next) {
    try {
        const userId = req.user.sub;
        const files = req.files;
        if (!files || !files.idPhoto || !files.facePhoto) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: "Both ID photo and face photo are required." });
            return;
        }
        const protocol = req.protocol;
        const host = req.get("host");
        const baseUrl = `${protocol}://${host}`;
        const idPhotoUrl = `${baseUrl}/uploads/${files.idPhoto[0].filename}`;
        const facePhotoUrl = `${baseUrl}/uploads/${files.facePhoto[0].filename}`;
        const idLocalPath = files.idPhoto[0].path;
        const faceLocalPath = files.facePhoto[0].path;
        const doc = await verificationService.submitVerification(userId, {
            ...req.body,
            idPhotoUrl,
            facePhotoUrl,
            idLocalPath,
            faceLocalPath,
        });
        res.status(StatusCodes.CREATED).json(doc);
    }
    catch (error) {
        if (error.message.includes("already")) {
            res.status(StatusCodes.CONFLICT).json({ message: error.message });
            return;
        }
        next(error);
    }
}
async function getMyVerification(req, res, next) {
    try {
        const userId = req.user.sub;
        const doc = await verificationService.getMyVerification(userId);
        res.status(StatusCodes.OK).json({ verification: doc });
    }
    catch (error) {
        next(error);
    }
}
async function getPendingVerifications(req, res, next) {
    try {
        // Only ADMIN should access this. Checked by requireRole middleware
        const pending = await verificationService.getPendingVerifications();
        res.status(StatusCodes.OK).json({ pending });
    }
    catch (error) {
        next(error);
    }
}
async function reviewVerification(req, res, next) {
    try {
        const docId = req.params.id;
        const doc = await verificationService.reviewVerification(docId, req.body);
        res.status(StatusCodes.OK).json({ message: "Verification reviewed successfully", doc });
    }
    catch (error) {
        next(error);
    }
}
export const verificationController = {
    submitVerification,
    getMyVerification,
    getPendingVerifications,
    reviewVerification,
};
