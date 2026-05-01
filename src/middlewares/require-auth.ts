import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "../lib/app-error.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        role: string;
      };
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Authentication required.");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired token.");
  }
};
