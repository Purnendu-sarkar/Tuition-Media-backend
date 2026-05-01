import { Router } from "express";

import { validateRequest } from "../../middlewares/validate-request.js";
import { authController } from "./auth.controller.js";
import { signInSchema, signUpSchema } from "./auth.validation.js";

export const authRouter = Router();

authRouter.post("/signup", validateRequest(signUpSchema), authController.signUp);
authRouter.post("/signin", validateRequest(signInSchema), authController.signIn);
