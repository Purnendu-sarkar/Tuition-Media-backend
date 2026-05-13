import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { guardianController } from "./guardian.controller.js";
import { createJobSchema, updateApplicationSchema } from "./guardian.validation.js";
export const guardianRouter = Router();
// Protect all guardian routes
guardianRouter.use(requireAuth);
guardianRouter.get("/dashboard", guardianController.getDashboard);
guardianRouter.get("/jobs", guardianController.getAllJobs);
guardianRouter.post("/jobs", validateRequest(createJobSchema), guardianController.createJob);
guardianRouter.get("/jobs/:jobId/applications", guardianController.getApplications);
guardianRouter.patch("/applications/:applicationId/status", validateRequest(updateApplicationSchema), guardianController.updateApplication);
guardianRouter.get("/saved", guardianController.getSavedTutors);
guardianRouter.post("/saved/:tutorId", guardianController.saveTutor);
guardianRouter.delete("/saved/:tutorId", guardianController.unsaveTutor);
guardianRouter.get("/saved/:tutorId/check", guardianController.checkIfSaved);
