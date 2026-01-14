import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";
import { config } from "@config/env";
import { LoginHistory } from "@/models/loginHistory";
import { User } from "@/models/user";
import { redisClient } from "@db/connectRedis";
import { lastActivityQueue } from "@modules/queue";

declare module "express-serve-static-core" {
    interface Locals {
        userID: string;
        loginHistoryID: string;
        tokenVersion: number;
    }
}

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { authToken } = req.cookies;

        if (!authToken) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Unauthorized access, auth token missing",
            });
        }

        const decorded = jwt.verify(authToken, config.JWT_KEY) as {
            userID: string;
            loginHistoryID: string;
            tokenVersion: number;
        };

        const { userID, tokenVersion, loginHistoryID } = decorded;

        const currentTokenVersion = await getCurrentTokenVersion(userID);
        if (currentTokenVersion !== tokenVersion) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Unauthorized access, token version mismatch",
            });
        }

        const loginHistoryTokenVersion = await getLoginHistoryTokenVersion(loginHistoryID);
        if (loginHistoryTokenVersion !== tokenVersion) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Unauthorized access, login history token version mismatch",
            });
        }

        res.locals.userID = userID;
        res.locals.tokenVersion = tokenVersion;
        res.locals.loginHistoryID = loginHistoryID;


        updateLastActivityDebounced(loginHistoryID);

        next();
    } catch (error) {
        logger.error("Error in protectRoute middleware:");
        logger.error(error);

        return sendResponse(res, {
            success: false,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal server error",
        });
    }
};

const getCurrentTokenVersion = async (userID: string): Promise<number | null> => {
    const value = await redisClient.get(`userID:${userID}`);
    if (value) {
        return parseInt(value);
    }

    const exisitingUser = await User.findById(userID).select("tokenVersion").lean();
    if (!exisitingUser) {
        return null;
    }

    await redisClient.set(`userID:${userID}`, exisitingUser.tokenVersion, {
        expiration: {
            type: "EX",
            value: 1 * 60 * 60,
        },
    });

    return exisitingUser.tokenVersion;
};

const getLoginHistoryTokenVersion = async (loginHistoryID: string): Promise<number | null> => {
    const value = await redisClient.get(`loginHistoryID:${loginHistoryID}`);
    if (value) {
        return parseInt(value);
    }

    const existingLoginHistory = await LoginHistory.findById(loginHistoryID)
        .select("tokenVersion")
        .lean();
    if (!existingLoginHistory) {
        return null;
    }

    await redisClient.set(`loginHistoryID:${loginHistoryID}`, existingLoginHistory.tokenVersion, {
        expiration: {
            type: "EX",
            value: 1 * 60 * 60,
        },
    });

    return existingLoginHistory.tokenVersion;
};

const updateLastActivityDebounced = async (loginHistoryID: string): Promise<void> => {
    try {
        const debounceKey = `activity:debounce:${loginHistoryID}`;

        const exists = await redisClient.exists(debounceKey);
        if (exists) {
            return;
        }

        await redisClient.set(debounceKey, "1", {
            expiration: {
                type: "EX",
                value: 3 * 60,
            },
        });

        lastActivityQueue.add("updateActivity", {
            loginHistoryID,
            timestamp: Date.now(),
        });
    } catch (error) {
        logger.error("Error in updateLastActivityDebounced:");
        logger.error(error);
    }
};
