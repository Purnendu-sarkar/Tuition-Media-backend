import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";
import { requireRole } from "../../middlewares/require-role.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { upload } from "../../middlewares/upload.js";
import { verificationController } from "./verification.controller.js";
import { submitVerificationSchema, reviewVerificationSchema } from "./verification.validation.js";

export const verificationRouter = Router();

// Protect all routes
verificationRouter.use(requireAuth);

// Tutor endpoints
verificationRouter.post(
  "/submit",
  upload.fields([
    { name: "idPhoto", maxCount: 1 },
    { name: "facePhoto", maxCount: 1 },
  ]),
  validateRequest(submitVerificationSchema),
  verificationController.submitVerification
);
verificationRouter.get("/me", verificationController.getMyVerification);

// Admin endpoints
verificationRouter.get(
  "/admin/pending",
  requireRole(["ADMIN"]),
  verificationController.getPendingVerifications
);

verificationRouter.patch(
  "/admin/:id",
  requireRole(["ADMIN"]),
  validateRequest(reviewVerificationSchema),
  verificationController.reviewVerification
);
