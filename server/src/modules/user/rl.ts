import { createRateLimiter } from "@/middlewares/rateLimiter";
import { FIFTEEN_MINUTES_IN_MS, FIVE_MINUTES_IN_MS } from "@/constants/time";

export const profileChangeLimiter = createRateLimiter({
    windowMs: FIVE_MINUTES_IN_MS,
    max: 10,
    prefix: "rl:user:profile",
});

export const passwordChangeLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES_IN_MS,
    max: 5,
    prefix: "rl:user:password",
});
