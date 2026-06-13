import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const shortcodeCheckLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    prefix: "rl:url:check",
});

const shortcodeCreateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 20,
    prefix: "rl:url:create",
});

const bulkCreateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    prefix: "rl:url:bulk-create",
});

const urlGeneralLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    prefix: "rl:url:general",
});

const redirectLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 100,
    prefix: "rl:url:redirect",
});

router.get("/check/:shortCode", shortcodeCheckLimiter, controllers.isShortcodeAvailable);
router.post("/", protectRoute, shortcodeCreateLimiter, controllers.createShortCode);
router.post("/bulk", protectRoute, bulkCreateLimiter, controllers.bulkCreateShortCodes);
router.get("/:shortCode", protectRoute, urlGeneralLimiter, controllers.getShortCodeInfo);
router.patch("/:shortCode", protectRoute, urlGeneralLimiter, controllers.editShortCode);
router.get(
    "/:shortCode/analytics",
    protectRoute,
    urlGeneralLimiter,
    controllers.shortCodePerformance
);
router.get(
    "/:shortCode/analytics/export",
    protectRoute,
    urlGeneralLimiter,
    controllers.exportShortCodeAnalytics
);

router.post("/redirect", redirectLimiter, controllers.redirectToOriginalUrl);

// Tag operations on shortcodes (moved from workspace module)
router.get("/:shortCode/tags", protectRoute, urlGeneralLimiter, controllers.getShortCodeTags);
router.patch("/:shortCode/tags", protectRoute, urlGeneralLimiter, controllers.setShortCodeTags);

export default router;
