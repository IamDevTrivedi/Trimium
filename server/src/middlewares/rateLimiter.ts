import RedisStore from "rate-limit-redis";
import rateLimit from "express-rate-limit";

import { config } from "@/config/env";
import { logger } from "@/utils/logger";
import { redisClient } from "@/db/connectRedis";
import { Request, Response } from "express";
import { getClientIP } from "@middlewares/IP";

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
            res.locals.visitorID = getClientIP(req);
            return res.locals.visitorID;
        },

        handler: (req, res, _next, options) => {
            logger.warn(
                `Rate limit exceeded for IP: ${getClientIP(req)} (limit: ${options.limit}, window: ${options.windowMs}ms, prefix: ${prefix})`
            );

            res.status(options.statusCode).json({
                success: false,
                message,
                remaining: 0,
                resetTime: new Date(Date.now() + options.windowMs),
            });
        },
    });
};

export const globalRateLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: config.isDevelopment ? Infinity : 1000,
    message: "Too many requests from this IP, please try again later.",
    prefix: "rl:global",
});
