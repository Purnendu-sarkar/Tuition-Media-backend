import { Router } from "express";

import { requireAuth } from "../../middlewares/require-auth.js";
import { aiController } from "./ai.controller.js";

export const aiRouter = Router();

// Protect AI routes
aiRouter.use(requireAuth);

aiRouter.post("/generate-job", aiController.generateJob);
