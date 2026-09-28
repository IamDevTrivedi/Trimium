import { createRateLimiter } from "@/middlewares/rateLimiter";
import { ONE_MINUTE_IN_MS } from "@/constants/time";

export const healthLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 120,
    prefix: "rl:health",
});
