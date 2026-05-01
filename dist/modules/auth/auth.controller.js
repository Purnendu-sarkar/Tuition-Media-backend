import { StatusCodes } from "http-status-codes";
import { buildSuccessResponse } from "../../lib/api-response.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { authService } from "./auth.service.js";
const signUp = asyncHandler(async (request, response) => {
    const result = await authService.signUp(request.body);
    response
        .status(StatusCodes.CREATED)
        .json(buildSuccessResponse("Account created successfully.", result));
});
const signIn = asyncHandler(async (request, response) => {
    const result = await authService.signIn(request.body);
    response.status(StatusCodes.OK).json(buildSuccessResponse("Signed in successfully.", result));
});
export const authController = {
    signUp,
    signIn,
};
