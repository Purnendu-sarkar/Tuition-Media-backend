import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { buildSuccessResponse } from "../../lib/api-response.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authService } from "./auth.service.js";
import { otpService } from "./otp.service.js";

const signUp = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.signUp(request.body);

  response
    .status(StatusCodes.CREATED)
    .json(buildSuccessResponse("Account created successfully.", result));
});

const signIn = asyncHandler(async (request: Request, response: Response) => {
  const result = await authService.signIn(request.body);

  response.status(StatusCodes.OK).json(buildSuccessResponse("Signed in successfully.", result));
});

const sendOtp = asyncHandler(async (request: Request, response: Response) => {
  const result = await otpService.sendOtp(request.body.email);
  response.status(StatusCodes.OK).json(buildSuccessResponse("OTP sent successfully.", result));
});

const verifyOtp = asyncHandler(async (request: Request, response: Response) => {
  const result = await otpService.verifyOtp(request.body.email, request.body.code);
  response.status(StatusCodes.OK).json(buildSuccessResponse("OTP verified successfully.", result));
});

export const authController = {
  signUp,
  signIn,
  sendOtp,
  verifyOtp,
};
