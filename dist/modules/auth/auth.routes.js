import { Router } from "express";
import { validateRequest } from "../../middlewares/validate-request.js";
import { authController } from "./auth.controller.js";
import { signInSchema, signUpSchema, sendOtpSchema, verifyOtpSchema } from "./auth.validation.js";
export const authRouter = Router();
authRouter.post("/signup", validateRequest(signUpSchema), authController.signUp);
authRouter.post("/signin", validateRequest(signInSchema), authController.signIn);
authRouter.post("/send-otp", validateRequest(sendOtpSchema), authController.sendOtp);
authRouter.post("/verify-otp", validateRequest(verifyOtpSchema), authController.verifyOtp);
