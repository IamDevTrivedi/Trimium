import { redisClient } from "@db/connectRedis";
import { logger } from "@utils/logger";

const LOGIN_FAILED_PREFIX = "login:failed:";
const LOGIN_COOLDOWN_PREFIX = "login:cooldown:";

const MAX_FAILED_ATTEMPTS = 5;
const WARNING_THRESHOLD = 3;
const FAILED_ATTEMPTS_TTL = 30 * 60; // 30 minutes
const COOLDOWN_TTL = 15 * 60; // 15 minutes

export interface CooldownStatus {
    blocked: boolean;
    remainingSeconds: number;
}

export interface FailedAttemptResult {
    count: number;
    shouldWarn: boolean;
    shouldLockout: boolean;
}

/**
 * Check if an email is currently in cooldown (blocked from login attempts)
 */
export const checkLoginCooldown = async (email: string): Promise<CooldownStatus> => {
    try {
        const cooldownKey = `${LOGIN_COOLDOWN_PREFIX}${email.toLowerCase()}`;
        const ttl = await redisClient.ttl(cooldownKey);

        if (ttl > 0) {
            return { blocked: true, remainingSeconds: ttl };
        }

        return { blocked: false, remainingSeconds: 0 };
    } catch (error) {
        logger.error("Error checking login cooldown:");
        logger.error(error);
        // Fail open - don't block legitimate users due to Redis errors
        return { blocked: false, remainingSeconds: 0 };
    }
};

/**
 * Record a failed login attempt and check if thresholds are reached
 */
export const recordFailedAttempt = async (email: string): Promise<FailedAttemptResult> => {
    try {
        const failedKey = `${LOGIN_FAILED_PREFIX}${email.toLowerCase()}`;
        const cooldownKey = `${LOGIN_COOLDOWN_PREFIX}${email.toLowerCase()}`;

        // Increment failed attempt counter
        const count = await redisClient.incr(failedKey);

        // Set/refresh TTL on first attempt or ensure it exists
        if (count === 1) {
            await redisClient.expire(failedKey, FAILED_ATTEMPTS_TTL);
        }

        const shouldWarn = count === WARNING_THRESHOLD;
        const shouldLockout = count >= MAX_FAILED_ATTEMPTS;

        // If max attempts reached, set cooldown
        if (shouldLockout) {
            await redisClient.set(cooldownKey, "1", {
                expiration: { type: "EX", value: COOLDOWN_TTL },
            });
            // Reset failed attempts counter after lockout
            await redisClient.del(failedKey);
        }

        return { count, shouldWarn, shouldLockout };
    } catch (error) {
        logger.error("Error recording failed attempt:");
        logger.error(error);
        // Return safe defaults - don't trigger alerts on errors
        return { count: 0, shouldWarn: false, shouldLockout: false };
    }
};

/**
 * Clear failed attempts counter on successful login
 */
export const clearFailedAttempts = async (email: string): Promise<void> => {
    try {
        const failedKey = `${LOGIN_FAILED_PREFIX}${email.toLowerCase()}`;
        await redisClient.del(failedKey);
    } catch (error) {
        logger.error("Error clearing failed attempts:");
        logger.error(error);
        // Non-critical - don't throw
    }
};

export const loginThrottleConfig = {
    MAX_FAILED_ATTEMPTS,
    WARNING_THRESHOLD,
    COOLDOWN_TTL,
};
