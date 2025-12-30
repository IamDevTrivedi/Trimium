import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { UAParser } from "ua-parser-js";
import { Request, Response } from "express";
import { config } from "@config/env";
import { transporter } from "@config/mailer";
import { redisClient } from "@db/connectRedis";
import { User } from "@models/user";
import { generateOTP } from "@utils/generateOTP";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";
import { z } from "zod";
import { NAME, OTP as OTP_REGEX, PASSWORD, USERNAME } from "@constants/regex";
import { LoginHistory } from "@/models/loginHistory";
import { emailTemplates } from "@utils/emailTemplates";

const getCookieOptions = (clear = false) => {
    return {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: (config.isProduction ? "none" : "lax") as "lax" | "none" | "strict",
        maxAge: clear ? undefined : 7 * 24 * 60 * 60 * 1000,
        path: "/",
    };
};

export const controllers = {
    sendOTPForCreateAccount: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.email(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Invalid request",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { email } = result.data;
            const existingUser = await User.findOne({
                email,
            });

            if (existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "User with given email already exists",
                    statusCode: StatusCodes.CONFLICT,
                });
            }

            const save = {
                OTP: generateOTP(),
                expiresAt: Date.now() + 5 * 60 * 1000,
                status: "NOT_VERIFIED",
                failedAttempts: 0,
            };

            await redisClient.set(`upcomingEmail:${email}`, JSON.stringify(save), {
                expiration: {
                    type: "EX",
                    value: 60 * 5,
                },
            });

            await transporter.sendMail({
                from: config.SENDER_EMAIL,
                to: email,
                subject: "Your Account Creation OTP",
                html: emailTemplates.sendOTPForCreateAccount({
                    OTP: save.OTP,
                }),
            });

            return sendResponse(res, {
                message: "OTP sent to email successfully",
            });
        } catch (error) {
            logger.error("Error in create Account");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in initlising account creation",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    verifyOTPForCreateAccount: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.email(),
                OTP: z.string().regex(OTP_REGEX),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Invalid request",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { email, OTP } = result.data;

            const save = await redisClient.get(`upcomingEmail:${email}`);

            if (!save) {
                return sendResponse(res, {
                    success: false,
                    message: "No OTP request found for this email",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const parsedSave = JSON.parse(save) as {
                OTP: string;
                expiresAt: number;
                status: "NOT_VERIFIED" | "VERIFIED";
                failedAttempts: 0 | 1 | 2;
            };

            if (parsedSave.status === "VERIFIED") {
                return sendResponse(res, {
                    success: false,
                    message: "OTP already verified for this email",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            if (Date.now() > parsedSave.expiresAt) {
                return sendResponse(res, {
                    success: false,
                    message: "OTP has expired",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            if (OTP !== parsedSave.OTP) {
                if (parsedSave.failedAttempts === 2) {
                    await redisClient.del(`upcomingEmail:${email}`);

                    return sendResponse(res, {
                        success: false,
                        message:
                            "Maximum OTP verification attempts exceeded. Please request a new OTP.",
                        statusCode: StatusCodes.BAD_REQUEST,
                    });
                }

                parsedSave.failedAttempts += 1;

                await redisClient.set(`upcomingEmail:${email}`, JSON.stringify(parsedSave), {
                    expiration: {
                        type: "EX",
                        value: Math.floor((parsedSave.expiresAt - Date.now()) / 1000),
                    },
                });

                return sendResponse(res, {
                    success: false,
                    message: "Invalid OTP",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            parsedSave.status = "VERIFIED";

            await redisClient.set(`upcomingEmail:${email}`, JSON.stringify(parsedSave), {
                expiration: {
                    type: "EX",
                    value: 60 * 15,
                },
            });

            return sendResponse(res, {
                message: "OTP verified successfully",
            });
        } catch (error) {
            logger.error("Error in verifying OTP for Account Creation");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in verifying OTP for Account Creation",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    createAccount: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                email: z.email(),
                firstName: z.string().regex(NAME, {
                    error: "First name contains invalid characters",
                }),
                lastName: z.string().regex(NAME, {
                    error: "Last name contains invalid characters",
                }),
                username: z.string().regex(USERNAME),
                password: z.string().regex(PASSWORD, {
                    error: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                }),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Invalid request",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }
            const { email, firstName, lastName, username, password } = result.data;

            const save = await redisClient.get(`upcomingEmail:${email}`);

            if (!save) {
                return sendResponse(res, {
                    success: false,
                    message: "No OTP request found for this email",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const parsedSave = JSON.parse(save) as {
                OTP: string;
                expiresAt: number;
                status: "NOT_VERIFIED" | "VERIFIED";
            };

            if (parsedSave.status !== "VERIFIED") {
                return sendResponse(res, {
                    success: false,
                    message: "OTP not verified for this email",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            const exist = await User.findOne({
                $or: [{ email }, { username }],
            });

            if (exist) {
                return sendResponse(res, {
                    success: false,
                    message: "User with given email or username already exists",
                    statusCode: StatusCodes.CONFLICT,
                });
            }

            const passwordHash = await bcrypt.hash(password, 14);

            const newUser = new User({
                firstName: firstName,
                lastName: lastName,
                email: email,
                passwordHash: passwordHash,
                username,
            });

            await newUser.save();
            await redisClient.del(`upcomingEmail:${email}`);

            return sendResponse(res, {
                statusCode: StatusCodes.CREATED,
                message: "Account created successfully",
            });
        } catch (error) {
            logger.error("Error in creating account");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in creating account",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    sendOTPForResetPassword: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                identity: z.union([z.email(), z.string().regex(USERNAME)]),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Invalid request",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { identity } = result.data;

            const existingUser = await User.findOne(
                z.string().regex(USERNAME).safeParse(identity).success
                    ? { username: identity }
                    : { email: identity }
            );

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "No user found with given identity",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const save = {
                OTP: generateOTP(),
                expiresAt: Date.now() + 5 * 60 * 1000,
                status: "NOT_VERIFIED",
                failedAttempts: 0,
            };

            await redisClient.set(`resetPassword:${existingUser.email}`, JSON.stringify(save), {
                expiration: {
                    type: "EX",
                    value: 60 * 5,
                },
            });

            await transporter.sendMail({
                from: config.SENDER_EMAIL,
                to: existingUser.email,
                subject: "Your Password Reset OTP",
                html: emailTemplates.sendOTPForResetPassword({
                    OTP: save.OTP,
                    UAinfo: res.locals.ua,
                    locationData: res.locals.location,
                    IPAddress: res.locals.clientIP,
                }),
            });

            return sendResponse(res, {
                message: "OTP sent to registered email successfully",
            });
        } catch (error) {
            logger.error("Error in sending OTP for Reset Password");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in sending OTP for Reset Password",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    verifyOTPForResetPassword: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                identity: z.union([z.email(), z.string().regex(USERNAME)]),
                OTP: z.string().regex(OTP_REGEX),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Invalid request",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { identity, OTP } = result.data;

            const existingUser = await User.findOne(
                z.string().regex(USERNAME).safeParse(identity).success
                    ? { username: identity }
                    : { email: identity }
            );

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "No user found with given identity",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const save = await redisClient.get(`resetPassword:${existingUser.email}`);

            if (!save) {
                return sendResponse(res, {
                    success: false,
                    message: "No OTP request found for this user",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const parsedSave = JSON.parse(save) as {
                OTP: string;
                expiresAt: number;
                status: "NOT_VERIFIED" | "VERIFIED";
                failedAttempts: 0 | 1 | 2;
            };

            if (parsedSave.status === "VERIFIED") {
                return sendResponse(res, {
                    success: false,
                    message: "OTP already verified for this user",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            if (Date.now() > parsedSave.expiresAt) {
                return sendResponse(res, {
                    success: false,
                    message: "OTP has expired",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            if (OTP !== parsedSave.OTP) {
                if (parsedSave.failedAttempts === 2) {
                    await redisClient.del(`resetPassword:${existingUser.email}`);

                    return sendResponse(res, {
                        success: false,
                        message:
                            "Maximum OTP verification attempts exceeded. Please request a new OTP.",
                        statusCode: StatusCodes.BAD_REQUEST,
                    });
                }

                parsedSave.failedAttempts += 1;

                await redisClient.set(
                    `resetPassword:${existingUser.email}`,
                    JSON.stringify(parsedSave),
                    {
                        expiration: {
                            type: "EX",
                            value: Math.floor((parsedSave.expiresAt - Date.now()) / 1000),
                        },
                    }
                );

                return sendResponse(res, {
                    success: false,
                    message: "Invalid OTP",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            parsedSave.status = "VERIFIED";

            await redisClient.set(
                `resetPassword:${existingUser.email}`,
                JSON.stringify(parsedSave),
                {
                    expiration: {
                        type: "EX",
                        value: 60 * 15,
                    },
                }
            );

            return sendResponse(res, {
                message: "OTP verified successfully",
            });
        } catch (error) {
            logger.error("Error in verifying OTP for Reset Password");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in verifying OTP for Reset Password",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    setNewPasswordForResetPassword: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                identity: z.union([z.email(), z.string().regex(USERNAME)]),
                password: z.string().regex(PASSWORD, {
                    error: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                }),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Invalid request",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { identity, password } = result.data;

            const existingUser = await User.findOne(
                z.string().regex(USERNAME).safeParse(identity).success
                    ? { username: identity }
                    : { email: identity }
            );

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "No user found with given identity",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const save = await redisClient.get(`resetPassword:${existingUser.email}`);

            if (!save) {
                return sendResponse(res, {
                    success: false,
                    message: "No OTP request found for this user",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const parsedSave = JSON.parse(save) as {
                OTP: string;
                expiresAt: number;
                status: "NOT_VERIFIED" | "VERIFIED";
                failedAttempts: 0 | 1 | 2;
            };

            if (parsedSave.status !== "VERIFIED") {
                return sendResponse(res, {
                    success: false,
                    message: "OTP not verified for this user",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            const passwordHash = await bcrypt.hash(password, 14);
            existingUser.passwordHash = passwordHash;
            await existingUser.save();

            await redisClient.del(`resetPassword:${existingUser.email}`);

            return sendResponse(res, {
                message: "Password reset successfully",
            });
        } catch (error) {
            logger.error("Error in setting new password for Reset Password");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in setting new password for Reset Password",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    login: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                identity: z.union([z.email(), z.string().regex(USERNAME)]),
                password: z.string(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Invalid request",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { identity, password } = result.data;

            const existingUser = await User.findOne(
                z.string().regex(USERNAME).safeParse(identity).success
                    ? { username: identity }
                    : { email: identity }
            );

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "No user found with given identity",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const match = await bcrypt.compare(password, existingUser.passwordHash);

            if (!match) {
                return sendResponse(res, {
                    success: false,
                    message: "Invalid credentials",
                    statusCode: StatusCodes.UNAUTHORIZED,
                });
            }

            const newLogin = new LoginHistory({
                accountID: existingUser._id,
                tokenVersion: existingUser.tokenVersion,
                UA: req.headers["user-agent"] || "unknown",
                IPAddress: res.locals.clientIP,
                lat: res.locals.location.lat,
                lon: res.locals.location.lon,
                displayName: res.locals.location.displayName,
            });

            const authToken = jwt.sign(
                {
                    userID: existingUser._id,
                    loginHistoryID: newLogin._id,
                    tokenVersion: existingUser.tokenVersion,
                },
                config.JWT_KEY,
                {
                    expiresIn: "7d",
                }
            );

            const cookieOptions = getCookieOptions();

            res.cookie(`authToken`, authToken, cookieOptions);

            await transporter.sendMail({
                from: config.SENDER_EMAIL,
                to: existingUser.email,
                subject: "New Login Alert",
                html: emailTemplates.loginAlert({
                    UAinfo: res.locals.ua,
                    IPAddress: res.locals.clientIP,
                    locationData: res.locals.location,
                }),
            });

            await newLogin.save();

            const data = {
                ...existingUser.toObject(),
                passwordHash: undefined,
                tokenVersion: undefined,
                __v: undefined,
            };

            return sendResponse(res, {
                message: "Login successful",
                data: data,
            });
        } catch (error) {
            logger.error("Error in setting new password for Reset Password");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in setting new password for Reset Password",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    logoutMyDevice: async (req: Request, res: Response) => {
        try {
            const { loginHistoryID } = res.locals;

            const existingLogin = await LoginHistory.findOne({
                _id: loginHistoryID,
            });

            // NOTE: This case should not occur as protectRoute middleware already checks for existing login
            if (!existingLogin) {
                return sendResponse(res, {
                    success: false,
                    message: "No active session found for this device",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            existingLogin.tokenVersion -= 1;
            await existingLogin.save();

            res.clearCookie("authToken", getCookieOptions(true));

            return sendResponse(res, {
                message: "Logged out from my device successfully",
            });
        } catch (error) {
            logger.error("Error in logging out from my device");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in logging out from my device",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    logoutAllOtherDevices: async (req: Request, res: Response) => {
        try {
            const { userID, loginHistoryID } = res.locals;

            const existingUser = await User.findById(userID);
            const existingLogin = await LoginHistory.findById(loginHistoryID);

            // NOTE: This case should not occur as protectRoute middleware already checks for existing user
            if (!existingUser || !existingLogin) {
                return sendResponse(res, {
                    success: false,
                    message: "User not found",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            existingUser.tokenVersion += 1;
            existingLogin.tokenVersion += 1;

            await existingUser.save();
            await existingLogin.save();

            const authToken = jwt.sign(
                {
                    userID: existingUser._id,
                    loginHistoryID: loginHistoryID,
                    tokenVersion: existingUser.tokenVersion,
                },
                config.JWT_KEY,
                {
                    expiresIn: "7d",
                }
            );

            const cookieOptions = getCookieOptions();
            res.cookie(`authToken`, authToken, cookieOptions);

            return sendResponse(res, {
                message: "Logged out from all other devices successfully",
            });
        } catch (error) {
            logger.error("Error in logging out from all devices");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in logging out from all devices",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    logoutParticularDevice: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                targetLoginHistoryID: z.string().length(24),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Invalid request",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { targetLoginHistoryID } = result.data;
            const { tokenVersion, loginHistoryID } = res.locals;

            if (loginHistoryID === targetLoginHistoryID) {
                return sendResponse(res, {
                    success: false,
                    message: "Cannot logout from current device",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            const existingLogin = await LoginHistory.findOne({
                _id: targetLoginHistoryID,
                tokenVersion,
            });

            if (!existingLogin) {
                return sendResponse(res, {
                    success: false,
                    message: "No active session found for the specified device",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            existingLogin.tokenVersion -= 1;
            await existingLogin.save();

            return sendResponse(res, {
                message: "Logged out from particular device successfully",
            });
        } catch (error) {
            logger.error("Error in logging out from particular device");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in logging out from particular device",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    me: async (req: Request, res: Response) => {
        try {
            const existingUser = await User.findById(res.locals.userID).select(
                "-passwordHash -tokenVersion -__v"
            );

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "User not found",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            return sendResponse(res, {
                message: "Current user details fetched successfully",
                data: existingUser,
            });
        } catch (error) {
            logger.error("Error in fetching current user details");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in fetching current user details",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    loginHistory: async (req: Request, res: Response) => {
        try {
            const schema = z
                .object({
                    targetLoginHistoryID: z.string().length(24).optional(),
                })
                .optional();

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Invalid request",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { targetLoginHistoryID } = result.data || {};
            const { tokenVersion, userID, loginHistoryID } = res.locals;

            if (targetLoginHistoryID) {
                const loginHistory =
                    await LoginHistory.findById(targetLoginHistoryID).select("-__v");

                if (!loginHistory) {
                    return sendResponse(res, {
                        success: false,
                        message: "No login history found for the given ID",
                        statusCode: StatusCodes.NOT_FOUND,
                    });
                }

                const parsedUA = new UAParser(loginHistory.UA).getResult();

                return sendResponse(res, {
                    message: "Login history fetched successfully",
                    data: {
                        parsedUA,
                        loginHistory,
                        isActive: loginHistory.tokenVersion === tokenVersion,
                        currentDevice: loginHistory._id.toString() === loginHistoryID,
                    },
                });
            } else {
                const allLoginHistories = await LoginHistory.find({
                    accountID: userID,
                })
                    .select("-__v")
                    .sort({ createdAt: -1 });

                const data = allLoginHistories.map((entry) => {
                    const parsedUA = new UAParser(entry.UA).getResult();

                    return {
                        parsedUA,
                        loginHistory: entry,
                        isActive: entry.tokenVersion === tokenVersion,
                        currentDevice: entry._id.toString() === loginHistoryID,
                        IPAddress: entry.IPAddress,
                        lat: entry.lat,
                        lon: entry.lon,
                        displayName: entry.displayName,
                    };
                });

                return sendResponse(res, {
                    message: "All login histories fetched successfully",
                    data,
                });
            }
        } catch (error) {
            logger.error("Error in fetching login history");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in fetching login history",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    checkUsernameAvailability: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                usernameToCheck: z.string().regex(USERNAME),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Invalid request",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { usernameToCheck } = result.data;

            const existingUser = await User.findOne({
                username: usernameToCheck,
            }).select("_id");

            if (existingUser) {
                return sendResponse(res, {
                    success: true,
                    message: "Username is already taken",
                    available: false,
                });
            }

            return sendResponse(res, {
                success: true,
                message: "Username is available",
                available: true,
            });
        } catch (error) {
            logger.error("Error in checking username availability");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "Error in checking username availability",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },
};
