import { StatusCodes } from "http-status-codes";
import { aiService } from "./ai.service.js";
async function generateJob(req, res, next) {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Prompt is required" });
        }
        const generatedData = await aiService.generateJobDescription(prompt);
        res.status(StatusCodes.OK).json(generatedData);
    }
    catch (error) {
        next(error);
    }
}
export const aiController = {
    generateJob,
};
