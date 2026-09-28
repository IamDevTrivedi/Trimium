import { createRateLimiter } from "@/middlewares/rateLimiter";
import { ONE_MINUTE_IN_MS } from "@/constants/time";

export const linkhubUpdateLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 30,
    prefix: "rl:linkhub:update",
});

export const linkhubPublicLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 60,
    prefix: "rl:linkhub:public",
});
