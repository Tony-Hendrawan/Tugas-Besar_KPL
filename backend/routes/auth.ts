/**
 * backend/routes/auth.ts
 * POST /api/auth/register
 * POST /api/auth/login
 */

import { Router } from "express";
import * as authCtrl from "../controllers/auth";

const router = Router();

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);

export default router;
