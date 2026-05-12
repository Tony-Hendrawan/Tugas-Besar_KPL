/**
 * backend/routes/kos.ts
 * GET  /api/kos
 * GET  /api/kos/:id
 * POST /api/compare
 */

import { Router } from "express";
import * as kosCtrl from "../controllers/kos";

const router = Router();

router.get("/", kosCtrl.getList);
router.get("/:id", kosCtrl.getDetail);

export default router;
