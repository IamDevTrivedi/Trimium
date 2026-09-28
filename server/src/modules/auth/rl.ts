import { createRateLimiter } from "@/middlewares/rateLimiter";
import { FIFTEEN_MINUTES_IN_MS, ONE_MINUTE_IN_MS } from "@/constants/time";

export const otpLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES_IN_MS,
    max: 5,
    prefix: "rl:auth:otp",
});

export const loginLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES_IN_MS,
    max: 10,
    prefix: "rl:auth:login",
});

export const authGeneralLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 60,
    prefix: "rl:auth:general",
});

export const usernameCheckLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 30,
    prefix: "rl:auth:username",
});
