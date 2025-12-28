import { LoginHistory } from "@/models/loginHistory";
import { User } from "@/models/user";
import { config } from "@config/env";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

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

        res.locals.userID = userID;
        res.locals.tokenVersion = tokenVersion;
        res.locals.loginHistoryID = loginHistoryID;

        const existingUser = await User.findOne({
            _id: userID,
            tokenVersion,
        });

        if (!existingUser) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Unauthorized access, invalid auth token",
            });
        }

        const existingLogin = await LoginHistory.findOne({
            _id: loginHistoryID,
            accountID: userID,
            tokenVersion,
        });

        if (!existingLogin) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.UNAUTHORIZED,
                message: "Unauthorized access, please login again",
            });
        }

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
