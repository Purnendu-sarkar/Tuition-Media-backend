import { Router } from "express";
import { reviewController } from "./review.controller.js";
import { requireAuth } from "../../middlewares/require-auth.js";

const router = Router();

router.post("/", requireAuth, reviewController.createReview);

export default router;
