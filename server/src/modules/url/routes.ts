import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const shortcodeCheckLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: "Too many shortcode check requests. Please slow down.",
    prefix: "rl:url:check",
});

const shortcodeCreateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 500,
    message: "Too many shortcode creation requests. Please slow down.",
    prefix: "rl:url:create",
});

const urlGeneralLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: "Too many requests. Please slow down.",
    prefix: "rl:url:general",
});

const redirectLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many redirect requests. Please slow down.",
    prefix: "rl:url:redirect",
});

router.post("/is-shortcode-available", shortcodeCheckLimiter, controllers.isShortcodeAvailable);
router.post("/create-shortcode", protectRoute, shortcodeCreateLimiter, controllers.createShortCode);
router.post("/get-shortcode-info", protectRoute, urlGeneralLimiter, controllers.getShortCodeInfo);
router.post("/edit-shortcode", protectRoute, urlGeneralLimiter, controllers.editShortCode);
router.post(
    "/shortcode-performance",
    protectRoute,
    urlGeneralLimiter,
    controllers.shortCodePerformance
);
router.post(
    "/export-analytics",
    protectRoute,
    urlGeneralLimiter,
    controllers.exportShortCodeAnalytics
);

router.post("/redirect", redirectLimiter, controllers.redirectToOriginalUrl);

export default router;
