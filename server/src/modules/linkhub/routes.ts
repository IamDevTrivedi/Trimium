import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";
import { uploadAvatar } from "@/middlewares/upload";

const router = Router();

const linkhubUpdateLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 30,
    prefix: "rl:linkhub:update",
});

const linkhubPublicLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 60,
    prefix: "rl:linkhub:public",
});

router.get("/me", protectRoute, controllers.getMyLinkhub);
router.put("/me", protectRoute, linkhubUpdateLimiter, controllers.updateMyLinkhub);
router.post(
    "/me/avatar",
    protectRoute,
    linkhubUpdateLimiter,
    uploadAvatar,
    controllers.uploadAvatar
);
router.get("/u/:username", linkhubPublicLimiter, controllers.getPublicLinkhub);

export default router;
