import RedisStore from "rate-limit-redis";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

import { config } from "@/config/env";
import { logger } from "@/utils/logger";
import { redisClient } from "@/db/connectRedis";
import { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
    interface Locals {
        visitorID: string;
    }
}

interface RateLimitOptions {
    windowMs: number;
    max: number;
    prefix?: string;
}

const BASE_DIFFICULTY = config.PoW_DIFFICULTY;
const SECRET = config.PoW_SECRET;

/**
 * Calculate adaptive difficulty based on rate limit settings: Based on the Sensitivity of the endpoint
 */
const calculateAdaptiveDifficulty = (options: { windowMs: number; max: number }): number => {
    const { windowMs, max } = options;
    const requestsPerMinute = (max / windowMs) * 60 * 1000;
    let add = 0;

    if (requestsPerMinute <= 5) {
        add += 3;
    } else if (requestsPerMinute <= 20) {
        add += 2;
    } else if (requestsPerMinute <= 100) {
        add += 1;
    }

    if (windowMs <= 30 * 1000) {
        add += 1;
    } else if (windowMs <= 60 * 1000) {
        add += 0;
    }

    return Math.min(BASE_DIFFICULTY + 3, Math.max(BASE_DIFFICULTY, BASE_DIFFICULTY + add));
};

const issuePoWChallenge = (
    req: Request,
    res: Response,
    options: { windowMs: number; max: number }
) => {
    const difficulty = calculateAdaptiveDifficulty(options);
    const expiry = Date.now() + 1 * 60 * 1000;
    const salt = Math.random().toString(36).substring(2, 15);
    const challenge = `${difficulty}|${expiry}|${salt}`;
    const integrity = crypto.createHmac("sha256", SECRET).update(challenge).digest("hex");

    const PoW_token = Buffer.from(`${challenge}|${integrity}`).toString("base64");

    return res.status(429).json({
        message: "Rate limit exceeded. Please solve the Proof of Work challenge.",
        PoW_token,
        difficulty,
        code: "rate_limit_pow_challenge",
    });
};

const verifyPoWAndRespond = (req: Request, res: Response, next: NextFunction) => {
    const PoW_header = req.headers["x-pow"];
    if (typeof PoW_header !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid PoW header.",
        });
    }

    const [PoW_Token, nonce] = PoW_header.split(":");
    if (!PoW_Token || !nonce) {
        return res.status(400).json({
            success: false,
            message: "Invalid PoW header format.",
        });
    }

    const [difficultyStr, expiryStr, salt, integrity] = Buffer.from(PoW_Token, "base64")
        .toString("utf-8")
        .split("|");

    if (!difficultyStr || !expiryStr || !salt || !integrity) {
        return res.status(400).json({
            success: false,
            message: "Invalid PoW token format.",
        });
    }

    const difficulty = parseInt(difficultyStr, 10);
    const expiry = parseInt(expiryStr, 10);

    if (Date.now() > expiry) {
        return res.status(400).json({
            success: false,
            message: "PoW challenge has expired.",
        });
    }

    const expectedIntegrity = crypto
        .createHmac("sha256", SECRET)
        .update(`${difficulty}|${expiry}|${salt}`)
        .digest("hex");

    if (integrity !== expectedIntegrity) {
        return res.status(400).json({
            success: false,
            message: "Invalid PoW token integrity.",
        });
    }

    const hash = crypto.createHash("sha256").update(`${PoW_Token}|${nonce}`).digest("hex");

    const leadingZeros = hash.match(/^0+/);
    const leadingZeroCount = leadingZeros ? leadingZeros[0].length : 0;

    if (leadingZeroCount < difficulty) {
        return res.status(400).json({
            success: false,
            message: "Invalid PoW solution.",
        });
    }

    return next();
};

export const createRateLimiter = ({ windowMs, max, prefix = "rl" }: RateLimitOptions) => {
    return rateLimit({
        store: new RedisStore({
            sendCommand: (...args: string[]) => redisClient.sendCommand(args),
            prefix,
        }),
        windowMs,
        max: config.isDevelopment ? Infinity : max,
        standardHeaders: true,
        legacyHeaders: false,
        skipFailedRequests: false,
        skipSuccessfulRequests: false,
        keyGenerator: (req: Request, res: Response) => {
            res.locals.visitorID = res.locals.clientIP;
            return res.locals.visitorID;
        },

        handler: (req, res, next) => {
            logger.warn(`Rate limit exceeded for IP: ${res.locals.visitorID}, prefix: ${prefix})`);
            logger.info(`windowMs: ${windowMs}, max: ${max}, prefix: ${prefix}`);

            const PoW = req.headers["x-pow"];
            if (typeof PoW === "undefined") {
                return issuePoWChallenge(req, res, { windowMs, max });
            }

            return verifyPoWAndRespond(req, res, next);
        },
    });
};

export const globalRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 1000,
    prefix: "rl:global",
});
