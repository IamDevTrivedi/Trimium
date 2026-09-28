import { createRateLimiter } from "@/middlewares/rateLimiter";
import { FIVE_MINUTES_IN_MS, ONE_MINUTE_IN_MS } from "@/constants/time";

export const workspaceCreateLimiter = createRateLimiter({
    windowMs: FIVE_MINUTES_IN_MS,
    max: 10,
    prefix: "rl:workspace:create",
});

export const workspaceMutationLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 30,
    prefix: "rl:workspace:mutation",
});

export const workspaceReadLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 60,
    prefix: "rl:workspace:read",
});

export const invitationLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 20,
    prefix: "rl:workspace:invitation",
});

export const tagLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 40,
    prefix: "rl:workspace:tag",
});
