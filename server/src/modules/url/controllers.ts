import { PASSWORD, PASSWORD_NOTICE, SHORTCODE, SHORTCODE_NOTICE } from "@/constants/regex";
import { URL } from "@/models/url";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import bcrypt from "bcrypt";
import { generateShortcode } from "@utils/generateShortCode";
import { Analytics } from "@/models/analytics";

export const controllers = {
    isShortcodeAvailable: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                shortCode: z.string().regex(SHORTCODE, {
                    error: SHORTCODE_NOTICE,
                }),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    statusCode: StatusCodes.BAD_REQUEST,
                    success: false,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { shortCode } = result.data;
            const existingURL = await URL.findOne({ shortCode }).select("_id").lean();

            if (existingURL) {
                return sendResponse(res, {
                    statusCode: StatusCodes.OK,
                    success: true,
                    message: "Shortcode is not available",
                    available: false,
                });
            }

            return sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: true,
                message: "Shortcode is available",
                available: true,
            });
        } catch (error) {
            logger.error("Error checking shortcode availability:");
            logger.error(error);

            return sendResponse(res, {
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal Server Error",
            });
        }
    },

    createShortCode: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                shortCode: z
                    .string()
                    .regex(SHORTCODE, {
                        error: SHORTCODE_NOTICE,
                    })
                    .optional()
                    .default(generateShortcode),

                originalURL: z.url(),

                title: z.string().min(1).max(255),
                description: z.string().max(1024).optional(),

                password: z
                    .string()
                    .regex(PASSWORD, {
                        error: PASSWORD_NOTICE,
                    })
                    .optional(),

                maxTransfers: z.int().optional(),

                schedule: z
                    .object({
                        startAt: z.coerce.date(),
                        endAt: z.coerce.date(),
                        countdownEnabled: z.boolean(),
                    })
                    .refine((data) => {
                        return data.startAt < data.endAt;
                    })
                    .optional(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    statusCode: StatusCodes.BAD_REQUEST,
                    success: false,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { shortCode, originalURL, title, description, password, maxTransfers, schedule } =
                result.data;
            const { userID } = res.locals;

            const existingURL = await URL.findOne({ shortCode }).select("_id").lean();

            if (existingURL) {
                return sendResponse(res, {
                    statusCode: StatusCodes.CONFLICT,
                    success: false,
                    message: "Shortcode is already in use",
                });
            }

            type PasswordProtect = {
                isEnabled: boolean;
                passwordHash: string;
            };

            type Transfer = {
                isEnabled: boolean;
                remainingTransfers: number;
                maxTransfers: number;
            };

            type Schedule = {
                isEnabled: boolean;
                startAt: Date;
                endAt: Date;
                countdownEnabled: boolean;
            };

            let passwordProtect: PasswordProtect | undefined = undefined;
            let transfer: Transfer | undefined = undefined;
            let scheduleObj: Schedule | undefined = undefined;

            if (typeof password === "string") {
                const passwordHash = await bcrypt.hash(password, 12);
                passwordProtect = {
                    isEnabled: true,
                    passwordHash,
                };
            }

            if (typeof maxTransfers === "number") {
                transfer = {
                    isEnabled: true,
                    remainingTransfers: maxTransfers,
                    maxTransfers,
                };
            }

            if (typeof schedule === "object") {
                scheduleObj = {
                    isEnabled: true,
                    startAt: schedule.startAt,
                    endAt: schedule.endAt,
                    countdownEnabled: schedule.countdownEnabled,
                };
            }

            const newURL = new URL({
                ownerID: userID,

                shortCode: shortCode,
                title: title,
                description: description,
                originalURL: originalURL,

                passwordProtect: passwordProtect,
                transfer: transfer,
                schedule: scheduleObj,
            });

            const newAnalytics = new Analytics({
                shortCode: shortCode,
                ownerID: userID,
            });

            await newURL.save();
            await newAnalytics.save();

            return sendResponse(res, {
                statusCode: StatusCodes.CREATED,
                success: true,
                message: "Shortcode created successfully",
                data: {
                    shortCode: newURL.shortCode,
                    originalURL: newURL.originalURL,
                },
            });
        } catch (error) {
            logger.error("Error creating shortcode:");
            logger.error(error);

            return sendResponse(res, {
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal Server Error",
            });
        }
    },
};
