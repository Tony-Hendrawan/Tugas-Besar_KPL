// @ts-nocheck

/**
 * backend/controllers/wrap.ts
 * Async error wrapper — agar error tidak crash server
 */

import { Request, Response } from "express";
import { sendError } from "../utils";

export function wrap(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response) => {
    fn(req, res).catch((err: any) => {
      console.error("[Controller Error]", err.message);
      sendError(res, err.message || "Terjadi kesalahan server", 500);
    });
  };
}
