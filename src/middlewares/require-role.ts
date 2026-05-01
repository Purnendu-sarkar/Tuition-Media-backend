import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(StatusCodes.UNAUTHORIZED).json({ message: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(StatusCodes.FORBIDDEN).json({ message: "You do not have permission to perform this action" });
      return;
    }

    next();
  };
}
