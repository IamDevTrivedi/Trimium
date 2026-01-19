/* eslint-disable @typescript-eslint/no-unused-vars */
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
    message?: string;
    prefix?: string;
}

const DIFFICULTY = 4;
const SECRET = "some_secret_salt_value";

const issuePoWChallenge = (req: Request, res: Response) => {
    const expiry = Date.now() + 1 * 60 * 1000;
    const salt = Math.random().toString(36).substring(2, 15);
    const challenge = `${DIFFICULTY}|${expiry}|${salt}`;
    const integrity = crypto.createHmac("sha256", SECRET).update(challenge).digest("hex");

    const PoW_token = Buffer.from(`${challenge}|${integrity}`).toString("base64");

    return res.status(429).json({
        message: "Rate limit exceeded. Please solve the Proof of Work challenge.",
        PoW_token,
        difficulty: DIFFICULTY,
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

export const createRateLimiter = ({
    windowMs,
    max,
    message = "Too many requests, please try again later.",
    prefix = "rl",
}: RateLimitOptions) => {
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

        handler: (req, res, _next, options) => {
            logger.warn(`Rate limit exceeded for IP: ${res.locals.visitorID}, prefix: ${prefix})`);

            const PoW = req.headers["x-pow"];
            if (typeof PoW === "undefined") {
                return issuePoWChallenge(req, res);
            }

            return verifyPoWAndRespond(req, res, _next);
        },
    });
};

export const globalRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 1000,
    message: "Too many requests from this IP, please try again later.",
    prefix: "rl:global",
});
