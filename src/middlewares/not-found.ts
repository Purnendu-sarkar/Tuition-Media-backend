import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export function notFoundHandler(request: Request, response: Response) {
  response.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
  });
}
