import type { NextFunction, Request, Response } from "express";
import crypto from "crypto";

import { config } from "@/config/env";
import { logger } from "@/utils/logger";
import { redisClient } from "@/db/connectRedis";
import { ONE_MINUTE_IN_MS } from "@/constants/time";
import { StatusCodes } from "http-status-codes";

declare module "express-serve-static-core" {
    interface Locals {
        visitorID: string;
    }
}

interface RateLimiterOptions {
    windowMs: number;
    max: number;
    prefix?: string;
}

const SLIDING_WINDOW_LUA = `
local key      = KEYS[1]
local windowMs = tonumber(ARGV[1])
local max      = tonumber(ARGV[2])
local member   = ARGV[3]

local time = redis.call('TIME')
local now  = tonumber(time[1]) * 1000 + math.floor(tonumber(time[2]) / 1000)

-- keep only entries inside [now - windowMs, now]
redis.call('ZREMRANGEBYSCORE', key, '-inf', '(' .. (now - windowMs))

local count = redis.call('ZCARD', key)

if count < max then
    redis.call('ZADD', key, now, member)
    redis.call('PEXPIRE', key, windowMs)
    return 1
end

return 0
`;

const SLIDING_WINDOW_SHA = crypto.createHash("sha1").update(SLIDING_WINDOW_LUA).digest("hex");

export const createRateLimiter = ({ windowMs, max, prefix = "rl" }: RateLimiterOptions) => {
    return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
        res.locals.visitorID = res.locals.clientIP;

        if (config.isDevelopment) {
            next();
            return;
        }

        const key = `${prefix}:${res.locals.visitorID}`;
        const member = crypto.randomUUID();
        const args = [String(windowMs), String(max), member];

        let allowed = 0;
        try {
            allowed = Number(
                await redisClient.sendCommand(["EVALSHA", SLIDING_WINDOW_SHA, "1", key, ...args])
            );
        } catch (err) {
            if (err instanceof Error && err.message.includes("NOSCRIPT")) {
                try {
                    allowed = Number(
                        await redisClient.sendCommand([
                            "EVAL",
                            SLIDING_WINDOW_LUA,
                            "1",
                            key,
                            ...args,
                        ])
                    );
                } catch (evalErr) {
                    logger.error(
                        `Rate limiter Redis error (prefix: ${prefix}): ${String(evalErr)}`
                    );
                    next();
                    return;
                }
            } else {
                logger.error(`Rate limiter Redis error (prefix: ${prefix}): ${String(err)}`);
                next();
                return;
            }
        }

        if (allowed === 1) {
            next();
            return;
        }

        const PoW_Token = req.headers["x-pow-token"];
        const PoW_Nonce = req.headers["x-pow-nonce"];

        if (typeof PoW_Token === "undefined") {
            const requestsPerMinute = (max / windowMs) * 60 * 1000;

            let add = 0;
            if (requestsPerMinute <= 5) {
                add += 3;
            } else if (requestsPerMinute <= 20) {
                add += 2;
            } else if (requestsPerMinute <= 100) {
                add += 1;
            }

            const difficulty = config.PoW_DIFFICULTY + add;
            const expiry = Date.now() + ONE_MINUTE_IN_MS;
            const salt = crypto.randomBytes(16).toString("hex");
            const challenge = `${expiry}.${difficulty}.${salt}`;
            const integrity = crypto
                .createHmac("sha256", config.PoW_SECRET)
                .update(challenge)
                .digest("hex");

            const token = `${challenge}.${integrity}`;

            res.status(StatusCodes.TOO_MANY_REQUESTS).json({
                message:
                    "You're going a bit too fast. Please complete the quick security check to continue.",
                token,
                code: "rate_limit_pow_challenge",
            });
            return;
        }

        if (typeof PoW_Token !== "string" || typeof PoW_Nonce !== "string") {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Please complete the security check and try again.",
            });
            return;
        }

        const parts = PoW_Token.split(".");
        if (parts.length !== 4) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message:
                    "Your security check response looks incomplete. Please try the check again.",
            });
            return;
        }

        const [expiryStr, difficultyStr, salt, integrity] = parts;

        if (!expiryStr || !difficultyStr || !salt || !integrity) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Your security check couldn't be verified. Please try the check again.",
            });
            return;
        }

        const difficulty = parseInt(difficultyStr, 10);
        const expiry = parseInt(expiryStr, 10);

        if (!Number.isFinite(difficulty) || !Number.isFinite(expiry)) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Your security check couldn't be verified. Please try the check again.",
            });
            return;
        }

        if (Date.now() > expiry) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Your security check has expired. Please try again.",
            });
            return;
        }

        const expectedIntegrity = crypto
            .createHmac("sha256", config.PoW_SECRET)
            .update(`${expiry}.${difficulty}.${salt}`)
            .digest("hex");

        if (integrity !== expectedIntegrity) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Your security check couldn't be verified. Please try the check again.",
            });
            return;
        }

        const hash = crypto.createHash("sha256").update(`${salt}|${PoW_Nonce}`).digest("hex");

        const leadingZeros = hash.match(/^0+/);
        const leadingZeroCount = leadingZeros ? leadingZeros[0].length : 0;

        if (leadingZeroCount < difficulty) {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Your security check didn't pass. Please try again.",
            });
            return;
        }

        next();
        return;
    };
};

export const globalRateLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 1000,
    prefix: "rl:global",
});
