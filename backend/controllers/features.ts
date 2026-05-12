// @ts-nocheck

/**
 * backend/controllers/features.ts
 * Controller untuk: estimasi biaya, rekomendasi, wishlist
 */

import { Request, Response } from "express";
import { calculateEstimation } from "../services/estimation";
import { getRecommendations } from "../services/recommendation";
import * as repo from "../repository";
import { sendSuccess, sendError } from "../utils";
import { wrap } from "./wrap";

// === ESTIMASI BIAYA HIDUP ===
export const getEstimation = wrap(async (req: Request, res: Response) => {
  const kosPrice = Number(req.query.price);
  if (!kosPrice || kosPrice <= 0) {
    sendError(res, "Parameter price wajib diisi dan > 0");
    return;
  }
  const result = calculateEstimation(kosPrice);
  sendSuccess(res, result, "Estimasi biaya berhasil dihitung");
});

// === REKOMENDASI KOS ===
export const getRecommendation = wrap(async (req: Request, res: Response) => {
  const { budget, location, facilities } = req.query;
  const result = await getRecommendations({
    budget: budget ? Number(budget) : undefined,
    location: location as string | undefined,
    facilities: facilities ? String(facilities).split(",") : undefined,
  });
  sendSuccess(res, result.data, result.message);
});

// === WISHLIST ===
export const getWishlist = wrap(async (req: Request, res: Response) => {
  const list = await repo.getWishlist(req.user!.id);
  sendSuccess(res, list, "Wishlist berhasil diambil");
});

export const addWishlist = wrap(async (req: Request, res: Response) => {
  const { kos_id } = req.body;
  if (!kos_id) {
    sendError(res, "kos_id wajib diisi");
    return;
  }
  const result = await repo.addToWishlist(req.user!.id, Number(kos_id));
  if (!result) {
    sendError(res, "Kos sudah ada di wishlist");
    return;
  }
  sendSuccess(res, result, "Berhasil ditambahkan ke wishlist", 201);
});

export const removeWishlist = wrap(async (req: Request, res: Response) => {
  const kosId = Number(req.params.kosId);
  const deleted = await repo.removeFromWishlist(req.user!.id, kosId);
  if (!deleted) {
    sendError(res, "Kos tidak ditemukan di wishlist", 404);
    return;
  }
  sendSuccess(res, null, "Berhasil dihapus dari wishlist");
});
