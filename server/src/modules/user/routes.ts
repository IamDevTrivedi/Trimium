import { Router } from "express";
import { controllers } from "../user/controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const profileChangeLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 10,
    message: "Too many profile update requests. Please try again later.",
    prefix: "rl:user:profile",
});

const passwordChangeLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many password change requests. Please try again later.",
    prefix: "rl:user:password",
});

router.post("/change-name", protectRoute, profileChangeLimiter, controllers.changeName);
router.post("/change-password", protectRoute, passwordChangeLimiter, controllers.changePassword);
router.post("/change-username", protectRoute, profileChangeLimiter, controllers.changeUsername);

export default router;
