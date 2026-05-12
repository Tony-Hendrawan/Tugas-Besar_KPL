// @ts-nocheck

/**
 * backend/controllers/auth.ts
 * TEKNIK: API — handler auth endpoints
 */

import { Request, Response } from "express";
import * as authService from "../services/auth";
import { sendSuccess, sendError } from "../utils";
import { wrap } from "./wrap";

export const register = wrap(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  if (!result.success) {
    sendError(res, result.message, 400);
    return;
  }
  sendSuccess(res, result.data, result.message, 201);
});

export const login = wrap(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  if (!result.success) {
    sendError(res, result.message, 401);
    return;
  }
  sendSuccess(res, result.data, result.message);
});
