import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const linktreeUpdateLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: "Too many linktree update requests. Please try again later.",
    prefix: "rl:linktree:update",
});

const linktreePublicLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: "Too many requests. Please try again later.",
    prefix: "rl:linktree:public",
});

router.get("/me", protectRoute, controllers.getMyLinktree);
router.put("/me", protectRoute, linktreeUpdateLimiter, controllers.updateMyLinktree);
router.get("/u/:username", linktreePublicLimiter, controllers.getPublicLinktree);

export default router;
