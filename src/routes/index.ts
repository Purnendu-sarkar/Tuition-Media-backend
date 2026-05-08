import { Router } from "express";

import { authRouter } from "../modules/auth/auth.routes.js";
import { healthRouter } from "../modules/health/health.routes.js";
import { tutorRouter } from "../modules/tutor/tutor.routes.js";
import { guardianRouter } from "../modules/guardian/guardian.routes.js";
import { jobRouter } from "../modules/job/job.routes.js";
import { aiRouter } from "../modules/ai/ai.routes.js";
import { verificationRouter } from "../modules/verification/verification.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { messageRouter } from "../modules/message/message.routes.js";
import { publicRouter } from "../modules/public/public.routes.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/public", publicRouter);
apiRouter.use("/tutor", tutorRouter);
apiRouter.use("/guardian", guardianRouter);
apiRouter.use("/jobs", jobRouter);
apiRouter.use("/ai", aiRouter);
apiRouter.use("/verification", verificationRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/messages", messageRouter);
