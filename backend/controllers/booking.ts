// @ts-nocheck

/**
 * backend/controllers/booking.ts
 * TEKNIK: API — handler pemesanan endpoints
 */

import { Request, Response } from "express";
import * as bookingService from "../services/booking";
import { sendSuccess, sendError } from "../utils";
import { wrap } from "./wrap";

export const create = wrap(async (req: Request, res: Response) => {
  const result = await bookingService.createPemesanan(req.user!.id, req.body);
  if (!result.success) {
    sendError(res, result.message);
    return;
  }
  sendSuccess(res, result.data, result.message, 201);
});

export const history = wrap(async (req: Request, res: Response) => {
  const result = await bookingService.getPemesananHistory(req.user!.id);
  sendSuccess(res, result.data, result.message);
});
