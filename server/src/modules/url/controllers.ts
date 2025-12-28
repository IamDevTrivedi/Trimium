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
import { Workspace } from "@/models/workspace";
import { sha256 } from "@utils/sha256";

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
                workspaceID: z.string().length(24),

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
                        messageToDisplay: z
                            .string()
                            .max(512)
                            .optional()
                            .default("This link is not yet active."),
                    })
                    .refine((data) => {
                        const now = new Date();
                        if (data.startAt < now || data.endAt < now) {
                            return false;
                        }
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

            const {
                shortCode,
                workspaceID,
                originalURL,
                title,
                description,
                password,
                maxTransfers,
                schedule,
            } = result.data;
            const { userID } = res.locals;

            const existingURL = await URL.findOne({ shortCode }).select("_id").lean();

            if (existingURL) {
                return sendResponse(res, {
                    statusCode: StatusCodes.CONFLICT,
                    success: false,
                    message: "Shortcode is already in use",
                });
            }

            const existingWorkspace = await Workspace.findOne({
                _id: workspaceID,
            });

            const permission = existingWorkspace?.members.find(
                (m) => m.userID.toString() === userID
            )?.permission;

            if (!permission || permission === "viewer") {
                return sendResponse(res, {
                    statusCode: StatusCodes.FORBIDDEN,
                    success: false,
                    message:
                        "You are not a member or do not have permission to add URLs to this workspace",
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
                messageToDisplay: string;
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
                    messageToDisplay: schedule.messageToDisplay,
                };
            }

            const newURL = new URL({
                shortCode: shortCode,
                title: title,

                description: description,
                originalURL: originalURL,
                workspaceID: workspaceID,

                passwordProtect: passwordProtect,
                transfer: transfer,
                schedule: scheduleObj,
            });

            const newAnalytics = new Analytics({
                shortCode: shortCode,
                workspaceID: workspaceID,
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

    redirectToOriginalUrl: async (req: Request, res: Response) => {
        type VERDICT =
            | "INVALID"
            | "INACTIVE"
            | "EXPIRED"
            | "SHOW_COUNTER"
            | "MAX_TRANSFER_REACHED"
            | "SHOW_PASSWORD_PROMPT"
            | "PASSWORD_INCORRECT"
            | "SUCCESS";
        try {
            const schema = z.object({
                shortCode: z.string().regex(SHORTCODE, {
                    error: SHORTCODE_NOTICE,
                }),
                password: z
                    .string()
                    .regex(PASSWORD, {
                        error: PASSWORD_NOTICE,
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
                    verdict: "INVALID" as VERDICT,
                });
            }

            const { shortCode, password } = result.data;

            const existingURL = await URL.findOne({
                shortCode: shortCode,
            });

            if (!existingURL) {
                return sendResponse(res, {
                    statusCode: StatusCodes.OK,
                    success: true,
                    message: "Invalid shortcode",
                    verdict: "INVALID" as VERDICT,
                });
            }

            const now = new Date();

            if (!existingURL.isActive) {
                return sendResponse(res, {
                    statusCode: StatusCodes.OK,
                    success: true,
                    message: "URL is inactive",
                    verdict: "INACTIVE" as VERDICT,
                });
            }

            if (existingURL.schedule.isEnabled) {
                if (now < existingURL.schedule.startAt) {
                    if (existingURL.schedule.countdownEnabled) {
                        return sendResponse(res, {
                            statusCode: StatusCodes.OK,
                            success: true,
                            message: "Show countdown timer",
                            verdict: "SHOW_COUNTER" as VERDICT,
                            displayContent: {
                                startAt: existingURL.schedule.startAt,
                                messageToDisplay: existingURL.schedule.messageToDisplay,
                            },
                        });
                    } else {
                        return sendResponse(res, {
                            statusCode: StatusCodes.OK,
                            success: true,
                            message: "Invalid shortcode",
                            verdict: "INVALID" as VERDICT,
                        });
                    }
                } else if (now > existingURL.schedule.endAt) {
                    return sendResponse(res, {
                        statusCode: StatusCodes.OK,
                        success: true,
                        message: "Shortcode has expired",
                        verdict: "EXPIRED" as VERDICT,
                    });
                }
            }

            if (existingURL.transfer.isEnabled) {
                if (existingURL.transfer.remainingTransfers <= 0) {
                    return sendResponse(res, {
                        statusCode: StatusCodes.OK,
                        success: true,
                        message: "Maximum transfer limit reached",
                        verdict: "MAX_TRANSFER_REACHED" as VERDICT,
                    });
                }
            }

            if (existingURL.passwordProtect.isEnabled) {
                if (typeof password !== "string") {
                    return sendResponse(res, {
                        statusCode: StatusCodes.OK,
                        success: true,
                        message: "Password required",
                        verdict: "SHOW_PASSWORD_PROMPT" as VERDICT,
                    });
                }

                const isPasswordCorrect = await bcrypt.compare(
                    password,
                    existingURL.passwordProtect.passwordHash
                );

                if (!isPasswordCorrect) {
                    return sendResponse(res, {
                        statusCode: StatusCodes.OK,
                        success: true,
                        message: "Incorrect password",
                        verdict: "PASSWORD_INCORRECT" as VERDICT,
                    });
                }
            }

            const existingAnalytics = await Analytics.findOne({ shortCode: shortCode });
            if (!existingAnalytics) {
                return sendResponse(res, {
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                    success: false,
                    message: "Analytics data not found",
                    verdict: "INVALID" as VERDICT,
                });
            }

            const IPHash = sha256(res.locals.clientIP);
            existingAnalytics.totalClicks += 1;
            if (!existingAnalytics.uniqueVisitors.includes(IPHash)) {
                existingAnalytics.uniqueVisitors.push(IPHash);
            }

            existingURL.transfer.remainingTransfers -= 1;

            const currentDevice = res.locals.ua.device.type;
            let deviceType: "desktop" | "mobile" | "tablet" | "others" = "others";

            if (
                currentDevice === "desktop" ||
                currentDevice === "mobile" ||
                currentDevice === "tablet"
            ) {
                deviceType = currentDevice;
            }

            existingAnalytics.deviceStats[deviceType] += 1;

            const currentBrowser = res.locals.ua.browser.name
                ? res.locals.ua.browser.name.toLowerCase()
                : "others";

            let browserType: "chrome" | "firefox" | "safari" | "edge" | "opera" | "others" =
                "others";

            if (
                currentBrowser === "chrome" ||
                currentBrowser === "firefox" ||
                currentBrowser === "safari" ||
                currentBrowser === "edge" ||
                currentBrowser === "opera"
            ) {
                browserType = currentBrowser as typeof browserType;
            }

            existingAnalytics.browserStats[browserType] += 1;

            const currentToday = now.toISOString().split("T")[0];
            const dailyStat = existingAnalytics.dailyStats.find(
                (ds) => ds.date.toISOString().split("T")[0] === currentToday
            );

            if (dailyStat) {
                dailyStat.totalClicks += 1;
                if (!dailyStat.uniqueVisitors.includes(IPHash)) {
                    dailyStat.uniqueVisitors.push(IPHash);
                }
            } else {
                existingAnalytics.dailyStats.push({
                    date: new Date(currentToday),
                    totalClicks: 1,
                    uniqueVisitors: [IPHash],
                });
            }

            const currentHour = now.getHours();
            existingAnalytics.hourlyStats[currentHour] += 1;

            const currentWeek = now.getDay();
            existingAnalytics.weeklyStats[currentWeek] += 1;

            const currentLocation = res.locals.location.country || "Unknown";
            if (existingAnalytics.locationStats.has(currentLocation)) {
                existingAnalytics.locationStats.set(
                    currentLocation,
                    existingAnalytics.locationStats.get(currentLocation)! + 1
                );
            } else {
                existingAnalytics.locationStats.set(currentLocation, 1);
            }

            await existingAnalytics.save();
            await existingURL.save();

            return sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: true,
                message: "Redirect to original URL",
                verdict: "SUCCESS" as VERDICT,
                originalURL: existingURL.originalURL,
            });
        } catch (error) {
            logger.error("Error redirecting to original URL:");
            logger.error(error);

            return sendResponse(res, {
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal Server Error",
                verdict: "INVALID" as VERDICT,
            });
        }
    },
};
