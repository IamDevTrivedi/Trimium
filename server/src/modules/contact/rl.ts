import { createRateLimiter } from "@/middlewares/rateLimiter";
import { FIVE_MINUTES_IN_MS } from "@/constants/time";

export const contactLimiter = createRateLimiter({
    windowMs: FIVE_MINUTES_IN_MS,
    max: 3,
    prefix: "rl:contact",
});
