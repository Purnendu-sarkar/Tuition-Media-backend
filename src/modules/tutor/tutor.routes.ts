import { Router } from "express";

import { requireAuth } from "../../middlewares/require-auth.js";
import { tutorController } from "./tutor.controller.js";

export const tutorRouter = Router();

// Protect all tutor routes
tutorRouter.use(requireAuth);

tutorRouter.get("/dashboard", tutorController.getDashboard);
