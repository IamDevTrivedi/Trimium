import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { config } from "@config/env";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";

const verifyEndpoint = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const tokenSchema = z.object({
    turnstileToken: z.string().min(1),
});

interface TurnstileVerificationResponse {
    success: boolean;
    "error-codes"?: string[];
}

export const verifyTurnstileToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = tokenSchema.safeParse(req.body);

        if (!result.success) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.BAD_REQUEST,
                message: "Missing or invalid security challenge token",
                error: z.treeifyError(result.error),
            });
        }

        const payload = new URLSearchParams({
            secret: config.TURNSTILE_SECRET_KEY,
            response: result.data.turnstileToken,
        });

        if (res.locals.clientIP) {
            payload.append("remoteip", res.locals.clientIP);
        }

        const turnstileResponse = await fetch(verifyEndpoint, {
            method: "POST",
            body: payload,
        });

        if (!turnstileResponse.ok) {
            logger.error(
                `Turnstile verification request failed with status ${turnstileResponse.status}`
            );

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.BAD_GATEWAY,
                message: "Unable to verify security challenge. Please try again.",
            });
        }

        const verification =
            (await turnstileResponse.json()) as TurnstileVerificationResponse;

        if (!verification.success) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.BAD_REQUEST,
                message: "Security challenge verification failed. Please try again.",
                errorCodes: verification["error-codes"] ?? [],
            });
        }

        if (typeof req.body === "object" && req.body !== null && "turnstileToken" in req.body) {
            delete req.body.turnstileToken;
        }

        return next();
    } catch (error) {
        logger.error("Error in verifyTurnstileToken middleware:");
        logger.error(error);

        return sendResponse(res, {
            success: false,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Internal server error",
        });
    }
};