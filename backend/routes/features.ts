/**
 * backend/routes/features.ts
 * Routes: estimasi, rekomendasi, wishlist
 */

import { Router } from "express";
import { authenticate } from "../middleware";
import * as featuresCtrl from "../controllers/features";

const router = Router();

// Public
router.get("/estimation", featuresCtrl.getEstimation);
router.get("/recommendation", featuresCtrl.getRecommendation);

// Authenticated (harus login)
router.get("/wishlist", authenticate, featuresCtrl.getWishlist);
router.post("/wishlist", authenticate, featuresCtrl.addWishlist);
router.delete("/wishlist/:kosId", authenticate, featuresCtrl.removeWishlist);

export default router;
