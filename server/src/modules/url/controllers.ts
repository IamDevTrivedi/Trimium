import {
    PASSWORD,
    PASSWORD_NOTICE,
    SHORTCODE,
    SHORTCODE_NOTICE,
    UTC_DATE,
    UTC_DATE_NOTICE,
} from "@/constants/regex";
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
                        startAt: z.string().regex(UTC_DATE, UTC_DATE_NOTICE),
                        endAt: z.string().regex(UTC_DATE, UTC_DATE_NOTICE),
                        countdownEnabled: z.boolean(),
                        messageToDisplay: z
                            .string()
                            .max(512)
                            .optional()
                            .default("This link is not yet active."),
                    })
                    .refine((data) => {
                        const now = new Date();
                        if (new Date(data.startAt) < now || new Date(data.endAt) < now) {
                            return false;
                        }
                        return new Date(data.startAt) < new Date(data.endAt);
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
                    maxTransfers,
                };
            }

            if (typeof schedule === "object") {
                scheduleObj = {
                    isEnabled: true,
                    startAt: new Date(schedule.startAt),
                    endAt: new Date(schedule.endAt),
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

    getShortCodeInfo: async (req: Request, res: Response) => {
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
            const { userID } = res.locals;

            const existingURL = await URL.findOne({ shortCode }).lean();

            if (!existingURL) {
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    message: "Shortcode not found",
                });
            }

            const existingWorkspace = await Workspace.findById(existingURL.workspaceID).lean();

            const member = existingWorkspace?.members.find((m) => m.userID.toString() === userID);

            if (!member) {
                return sendResponse(res, {
                    statusCode: StatusCodes.FORBIDDEN,
                    success: false,
                    message: "You are not a member of the workspace associated with this shortcode",
                });
            }

            return sendResponse(res, {
                message: "Shortcode info retrieved successfully",
                success: true,
                statusCode: StatusCodes.OK,
                data: existingURL,
            });
        } catch (error) {
            logger.error("Error getting shortcode info:");
            logger.error(error);

            return sendResponse(res, {
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal Server Error",
            });
        }
    },

    editShortCode: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                shortCode: z.string().regex(SHORTCODE, {
                    error: SHORTCODE_NOTICE,
                }),

                title: z.string().min(1).max(255).optional(),
                description: z.string().min(1).max(1024).optional(),

                originalURL: z.url().optional(),
                isActive: z.boolean().optional(),

                maxTransfers: z.int().nonnegative().optional(),

                password: z.string().regex(PASSWORD, PASSWORD_NOTICE).optional(),

                schedule: z
                    .object({
                        startAt: z.string().regex(UTC_DATE, UTC_DATE_NOTICE),
                        endAt: z.string().regex(UTC_DATE, UTC_DATE_NOTICE),
                        countdownEnabled: z.boolean(),
                        messageToDisplay: z.string().max(512).optional(),
                    })
                    .refine((data) => {
                        const now = new Date();
                        if (new Date(data.startAt) < now || new Date(data.endAt) < now) {
                            return false;
                        }
                        return new Date(data.startAt) < new Date(data.endAt);
                    })
                    .optional(),

                rmSchedule: z.boolean().optional(),
                rmPassword: z.boolean().optional(),
                rmTransferLimit: z.boolean().optional(),
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
                title,
                description,
                originalURL,
                isActive,
                maxTransfers,
                password,
                schedule,
                rmSchedule,
                rmPassword,
                rmTransferLimit,
            } = result.data;
            const { userID } = res.locals;

            const existingURL = await URL.findOne({ shortCode });

            if (!existingURL) {
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    message: "Shortcode not found",
                });
            }

            const existingWorkspace = await Workspace.findById(existingURL.workspaceID).lean();
            const member = existingWorkspace?.members.find((m) => m.userID.toString() === userID);

            if (!member || member.permission === "viewer") {
                return sendResponse(res, {
                    statusCode: StatusCodes.FORBIDDEN,
                    success: false,
                    message:
                        "You are not a member or do not have permission to edit URLs in this workspace",
                });
            }

            if (title) {
                existingURL.title = title;
            }

            if (description) {
                existingURL.description = description;
            }

            if (originalURL) {
                existingURL.originalURL = originalURL;
            }

            if (typeof isActive === "boolean") {
                existingURL.isActive = isActive;
            }

            if (typeof maxTransfers === "number") {
                existingURL.transfer.isEnabled = true;
                existingURL.transfer.maxTransfers = maxTransfers;
            }

            if (typeof password === "string") {
                const passwordHash = await bcrypt.hash(password, 12);
                existingURL.passwordProtect.isEnabled = true;
                existingURL.passwordProtect.passwordHash = passwordHash;
            }

            if (typeof schedule === "object") {
                existingURL.schedule.isEnabled = true;
                existingURL.schedule.startAt = new Date(schedule.startAt);
                existingURL.schedule.endAt = new Date(schedule.endAt);
                existingURL.schedule.countdownEnabled = schedule.countdownEnabled;
                if (schedule.messageToDisplay) {
                    existingURL.schedule.messageToDisplay = schedule.messageToDisplay;
                }
            }

            if (rmSchedule) {
                existingURL.schedule.isEnabled = false;
            }

            if (rmPassword) {
                existingURL.passwordProtect.isEnabled = false;
            }

            if (rmTransferLimit) {
                existingURL.transfer.isEnabled = false;
            }

            await existingURL.save();

            return sendResponse(res, {
                statusCode: StatusCodes.OK,
                success: true,
                message: "Shortcode info updated successfully",
            });
        } catch (error) {
            logger.error("Error editing shortcode info:");
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

            const existingAnalytics = await Analytics.findOne({ shortCode: shortCode });
            if (!existingAnalytics) {
                return sendResponse(res, {
                    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                    success: false,
                    message: "Analytics data not found",
                    verdict: "INVALID" as VERDICT,
                });
            }

            existingAnalytics.lands += 1;
            await existingAnalytics.save();

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
                if (existingAnalytics.totalClicks >= existingURL.transfer.maxTransfers) {
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

            const IPHash = sha256(res.locals.clientIP);
            existingAnalytics.totalClicks += 1;
            if (!existingAnalytics.uniqueVisitors.includes(IPHash)) {
                existingAnalytics.uniqueVisitors.push(IPHash);
            }

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

    shortCodePerformance: async (req: Request, res: Response) => {
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
            const { userID } = res.locals;

            const existingURL = await URL.findOne({ shortCode })
                .select("-__v -_id -updatedAt")
                .lean();
            const existingAnalytics = await Analytics.findOne({ shortCode: shortCode })
                .select("-__v -_id -updatedAt")
                .lean();

            if (!existingURL || !existingAnalytics) {
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    message: "Shortcode not found",
                });
            }

            const existingWorkspace = await Workspace.findById(existingURL.workspaceID).lean();
            const member = existingWorkspace?.members.find((m) => m.userID.toString() === userID);

            if (!member) {
                return sendResponse(res, {
                    statusCode: StatusCodes.FORBIDDEN,
                    success: false,
                    message: "You are not a member of the workspace associated with this shortcode",
                });
            }

            return sendResponse(res, {
                message: "Short link performance retrieved successfully",
                success: true,
                statusCode: StatusCodes.OK,
                data: {
                    title: existingURL.title,
                    description: existingURL.description,

                    originalURL: existingURL.originalURL,

                    isActive: existingURL.isActive,

                    isPasswordProtected: existingURL.passwordProtect.isEnabled,
                    transfer: existingURL.transfer,
                    schedule: existingURL.schedule,

                    ...existingAnalytics,
                    uniqueVisitors: existingAnalytics.uniqueVisitors.length,
                    dailyStats: existingAnalytics.dailyStats.map((ds) => {
                        return {
                            date: ds.date,
                            totalClicks: ds.totalClicks,
                            uniqueVisitors: ds.uniqueVisitors.length,
                        };
                    }),

                    createdAt: existingURL.createdAt,
                },
                permission: member.permission,
            });
        } catch (error) {
            logger.error("Error getting short link performance:");
            logger.error(error);

            return sendResponse(res, {
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal Server Error",
            });
        }
    },

    exportShortCodeAnalytics: async (req: Request, res: Response) => {
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
            const { userID } = res.locals;

            const existingURL = await URL.findOne({ shortCode })
                .select("workspaceID title originalURL createdAt")
                .lean();
            const existingAnalytics = await Analytics.findOne({ shortCode: shortCode }).lean();

            if (!existingURL || !existingAnalytics) {
                return sendResponse(res, {
                    statusCode: StatusCodes.NOT_FOUND,
                    success: false,
                    message: "Shortcode not found",
                });
            }

            const existingWorkspace = await Workspace.findById(existingURL.workspaceID).lean();
            const member = existingWorkspace?.members.find((m) => m.userID.toString() === userID);

            if (!member) {
                return sendResponse(res, {
                    statusCode: StatusCodes.FORBIDDEN,
                    success: false,
                    message: "You are not a member of the workspace associated with this shortcode",
                });
            }

            // Build CSV content
            const csvRows: string[] = [];

            // Header section
            csvRows.push("# Short Link Analytics Export");
            csvRows.push(`# Generated: ${new Date().toISOString()}`);
            csvRows.push(`# Short Code: ${shortCode}`);
            csvRows.push(`# Title: ${existingURL.title}`);
            csvRows.push(`# Original URL: ${existingURL.originalURL}`);
            csvRows.push(`# Created At: ${existingURL.createdAt}`);
            csvRows.push("");

            // Summary section
            csvRows.push("## Summary");
            csvRows.push("Metric,Value");
            csvRows.push(`Total Clicks,${existingAnalytics.totalClicks}`);
            csvRows.push(`Total Lands,${existingAnalytics.lands}`);
            csvRows.push(`Unique Visitors,${existingAnalytics.uniqueVisitors.length}`);
            csvRows.push("");

            // Device stats
            csvRows.push("## Device Statistics");
            csvRows.push("Device,Count");
            csvRows.push(`Desktop,${existingAnalytics.deviceStats.desktop}`);
            csvRows.push(`Mobile,${existingAnalytics.deviceStats.mobile}`);
            csvRows.push(`Tablet,${existingAnalytics.deviceStats.tablet}`);
            csvRows.push(`Others,${existingAnalytics.deviceStats.others}`);
            csvRows.push("");

            // Browser stats
            csvRows.push("## Browser Statistics");
            csvRows.push("Browser,Count");
            csvRows.push(`Chrome,${existingAnalytics.browserStats.chrome}`);
            csvRows.push(`Firefox,${existingAnalytics.browserStats.firefox}`);
            csvRows.push(`Safari,${existingAnalytics.browserStats.safari}`);
            csvRows.push(`Edge,${existingAnalytics.browserStats.edge}`);
            csvRows.push(`Opera,${existingAnalytics.browserStats.opera}`);
            csvRows.push(`Others,${existingAnalytics.browserStats.others}`);
            csvRows.push("");

            // Location stats
            csvRows.push("## Location Statistics");
            csvRows.push("Location,Count");
            const locationStats = existingAnalytics.locationStats;
            if (locationStats) {
                if (locationStats instanceof Map) {
                    locationStats.forEach((count, location) => {
                        csvRows.push(`"${location}",${count}`);
                    });
                } else if (typeof locationStats === "object") {
                    Object.entries(locationStats).forEach(([location, count]) => {
                        csvRows.push(`"${location}",${count}`);
                    });
                }
            }
            csvRows.push("");

            // Hourly stats
            csvRows.push("## Hourly Statistics");
            csvRows.push("Hour,Clicks");
            existingAnalytics.hourlyStats.forEach((clicks, hour) => {
                csvRows.push(`${String(hour).padStart(2, "0")}:00,${clicks}`);
            });
            csvRows.push("");

            // Weekly stats
            csvRows.push("## Weekly Statistics");
            csvRows.push("Day,Clicks");
            const weekDays = [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ];
            existingAnalytics.weeklyStats.forEach((clicks, index) => {
                csvRows.push(`${weekDays[index]},${clicks}`);
            });
            csvRows.push("");

            // Daily stats
            csvRows.push("## Daily Statistics");
            csvRows.push("Date,Total Clicks,Unique Visitors");
            existingAnalytics.dailyStats.forEach((ds) => {
                const dateStr = new Date(ds.date).toISOString().split("T")[0];
                csvRows.push(`${dateStr},${ds.totalClicks},${ds.uniqueVisitors.length}`);
            });

            const csvContent = csvRows.join("\n");

            res.setHeader("Content-Type", "text/csv");
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="analytics-${shortCode}-${new Date().toISOString()}.csv"`
            );

            return res.status(StatusCodes.OK).send(csvContent);
        } catch (error) {
            logger.error("Error exporting short link analytics:");
            logger.error(error);

            return sendResponse(res, {
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                success: false,
                message: "Internal Server Error",
            });
        }
    },
};
