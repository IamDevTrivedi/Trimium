import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";
import { uploadAvatar } from "@/middlewares/upload";

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

router.post("/get-my-profile", protectRoute, controllers.getMyLinkhub);
router.post("/update-my-profile", protectRoute, linkhubUpdateLimiter, controllers.updateMyLinkhub);
router.post("/update-avatar", protectRoute, linkhubUpdateLimiter, uploadAvatar, controllers.uploadAvatar);
router.post("/public-profile", linkhubPublicLimiter, controllers.getPublicLinkhub);

export default router;
