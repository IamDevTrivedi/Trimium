import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const linkhubUpdateLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: "Too many linkhub update requests. Please try again later.",
    prefix: "rl:linkhub:update",
});

const linkhubPublicLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 60,
    message: "Too many requests. Please try again later.",
    prefix: "rl:linkhub:public",
});

router.get("/me", protectRoute, controllers.getMyLinkhub);
router.put("/me", protectRoute, linkhubUpdateLimiter, controllers.updateMyLinkhub);
router.get("/u/:username", linkhubPublicLimiter, controllers.getPublicLinkhub);

export default router;
