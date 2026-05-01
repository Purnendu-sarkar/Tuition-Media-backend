import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";

import { AppError } from "../lib/app-error.js";

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    response.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Validation failed.",
      errors: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    response.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      success: false,
      message:
        "Database connection failed. Check backend/.env DATABASE_URL and make sure the project PostgreSQL server is running.",
    });
    return;
  }

  console.error(error);

  response.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong on the server.",
  });
}
