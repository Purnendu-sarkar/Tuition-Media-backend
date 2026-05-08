import { Router } from "express";
import { publicController } from "./public.controller.js";

export const publicRouter = Router();

publicRouter.get("/tutors", publicController.getTutors);
publicRouter.get("/tutors/:id", publicController.getTutorById);
publicRouter.get("/jobs", publicController.getJobs);
