import { createRateLimiter } from "@/middlewares/rateLimiter";
import { ONE_MINUTE_IN_MS } from "@/constants/time";

export const shortcodeCheckLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 30,
    prefix: "rl:url:check",
});

export const shortcodeCreateLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 20,
    prefix: "rl:url:create",
});

export const bulkCreateLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 10,
    prefix: "rl:url:bulk-create",
});

export const urlGeneralLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 60,
    prefix: "rl:url:general",
});

export const redirectLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 100,
    prefix: "rl:url:redirect",
});
