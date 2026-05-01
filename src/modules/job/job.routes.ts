import { Router } from "express";

import { requireAuth } from "../../middlewares/require-auth.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { jobController } from "./job.controller.js";
import { applyJobSchema } from "./job.validation.js";

export const jobRouter = Router();

// Publicly readable jobs (or at least accessible to all authenticated users)
// Wait, for now let's just make it accessible to everyone or requireAuth?
// Tutors need to be authenticated to apply. Let's make view open to all (or just auth)
jobRouter.get("/", jobController.getAllJobs);
jobRouter.get("/:id", jobController.getJob);

// Require auth and validation for applying
jobRouter.post("/:id/apply", requireAuth, validateRequest(applyJobSchema), jobController.applyJob);
