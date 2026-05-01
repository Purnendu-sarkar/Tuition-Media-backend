import { Router } from "express";
import { requireAuth } from "../../middlewares/require-auth.js";
import { requireRole } from "../../middlewares/require-role.js";
import { adminController } from "./admin.controller.js";

export const adminRouter = Router();

// Protect all routes: Must be authenticated AND have the 'ADMIN' role
adminRouter.use(requireAuth);
adminRouter.use(requireRole(["ADMIN"]));

adminRouter.get("/stats", adminController.getStats);
adminRouter.get("/users", adminController.getUsers);
adminRouter.delete("/users/:id", adminController.deleteUser);
adminRouter.get("/jobs", adminController.getJobs);
adminRouter.delete("/jobs/:id", adminController.deleteJob);
