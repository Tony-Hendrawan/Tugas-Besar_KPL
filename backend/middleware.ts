/**
 * backend/middleware.ts
 * Middleware: authenticate (JWT)
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "./config";
import { sendError } from "./utils";

declare global {
  namespace Express {
    interface Request {
      user?: { id: number };
    }
  }
}

/** Verifikasi JWT token, simpan user ke req.user */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    sendError(res, "Token tidak ditemukan", 401);
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, config.jwt.secret) as { id: number };
    next();
  } catch {
    sendError(res, "Token tidak valid", 401);
  }
}
