// @ts-nocheck

/**
 * backend/controllers/kos.ts
 * TEKNIK: API — handler kos & compare endpoints
 */

import { Request, Response } from "express";
import * as kosService from "../services/kos";
import { sendSuccess, sendError } from "../utils";
import { wrap } from "./wrap";

export const getList = wrap(async (req: Request, res: Response) => {
  const { location, maxPrice } = req.query;
  const result = await kosService.getAllKos({
    kota: location as string | undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });
  sendSuccess(res, result.data, result.message);
});

export const getDetail = wrap(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) {
    sendError(res, "ID kos tidak valid");
    return;
  }
  const result = await kosService.getKosDetail(id);
  if (!result.success) {
    sendError(res, result.message, 404);
    return;
  }
  sendSuccess(res, result.data, result.message);
});

export const compare = wrap(async (req: Request, res: Response) => {
  const { kosIds } = req.body;
  const result = await kosService.compareKos(kosIds);
  if (!result.success) {
    sendError(res, result.message);
    return;
  }
  sendSuccess(res, result.data, result.message);
});
