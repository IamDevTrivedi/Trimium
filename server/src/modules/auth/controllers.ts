import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
import { UAParser } from "ua-parser-js";
import type { Request, Response } from "express";
import { config } from "@config/env";
import { redisClient } from "@db/connectRedis";
import { User } from "@models/user";
import { generateOTP } from "@utils/generateOTP";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";
import { z } from "zod";
import { NAME, OTP as OTP_REGEX, PASSWORD, USERNAME } from "@constants/regex";
import { HASH_OPTIONS } from "@config/argon2";
import { LoginHistory } from "@models/loginHistory";
import { emailTemplates } from "@utils/emailTemplates";
import { emailQueue, QueueNames } from "@modules/queue";
import {
    checkLoginCooldown,
    recordFailedAttempt,
    clearFailedAttempts,
    loginThrottleConfig,
} from "@utils/loginThrottle";
import { REVOKE_TOKEN_EXPIRATION_TIME } from "@/constants/app";

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
                    message: "Please provide a valid email address.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { email } = result.data;
            const existingUser = await User.findOne({
                email,
            })
                .select("_id")
                .lean();

            if (existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "An account with this email already exists. Please log in instead.",
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

            await emailQueue.add(QueueNames.SEND_EMAIL, {
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
                message:
                    "We couldn't start account creation right now. Please try again in a moment.",
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
                    message: "Please provide a valid email and verification code.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { email, OTP } = result.data;

            const save = await redisClient.get(`upcomingEmail:${email}`);

            if (!save) {
                return sendResponse(res, {
                    success: false,
                    message:
                        "We couldn't find a verification code request for this email. Please request a new one.",
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
                    message:
                        "This verification code has already been used. Please sign in to continue.",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            if (Date.now() > parsedSave.expiresAt) {
                return sendResponse(res, {
                    success: false,
                    message: "Your verification code has expired. Please request a new one.",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            if (OTP !== parsedSave.OTP) {
                if (parsedSave.failedAttempts === 2) {
                    await redisClient.del(`upcomingEmail:${email}`);

                    return sendResponse(res, {
                        success: false,
                        message:
                            "Too many failed attempts. Please request a new verification code and try again.",
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
                    message: "The verification code you entered is incorrect. Please try again.",
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
                message: "We couldn't verify your code right now. Please try again in a moment.",
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
                    error: "Password must be 8-128 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                }),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Please review your account details and try again.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }
            const { email, firstName, lastName, username, password } = result.data;

            const save = await redisClient.get(`upcomingEmail:${email}`);

            if (!save) {
                return sendResponse(res, {
                    success: false,
                    message:
                        "We couldn't find a verification code request for this email. Please request a new one.",
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
                    message: "Please verify your code before creating an account.",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            const exist = await User.findOne({
                $or: [{ email }, { username }],
            })
                .select("_id")
                .lean();

            if (exist) {
                return sendResponse(res, {
                    success: false,
                    message:
                        "An account with this email or username already exists. Please log in instead.",
                    statusCode: StatusCodes.CONFLICT,
                });
            }

            const passwordHash = await argon2.hash(password, HASH_OPTIONS);

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
                message: "We couldn't create your account right now. Please try again in a moment.",
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
                    message: "Please enter a valid email or username.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { identity } = result.data;

            const existingUser = await User.findOne(
                z.string().regex(USERNAME).safeParse(identity).success
                    ? { username: identity }
                    : { email: identity }
            )
                .select("email")
                .lean();

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "We couldn't find an account with that email or username.",
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

            await emailQueue.add(QueueNames.SEND_EMAIL, {
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
                message: "We couldn't send the reset code right now. Please try again in a moment.",
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
                    message:
                        "Please enter a valid email or username along with your verification code.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { identity, OTP } = result.data;

            const existingUser = await User.findOne(
                z.string().regex(USERNAME).safeParse(identity).success
                    ? { username: identity }
                    : { email: identity }
            )
                .select("email")
                .lean();

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "We couldn't find an account with that email or username.",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const save = await redisClient.get(`resetPassword:${existingUser.email}`);

            if (!save) {
                return sendResponse(res, {
                    success: false,
                    message: "No password reset request was found. Please request a new code.",
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
                    message:
                        "This verification code has already been used. Please sign in to continue.",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            if (Date.now() > parsedSave.expiresAt) {
                return sendResponse(res, {
                    success: false,
                    message: "Your verification code has expired. Please request a new one.",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            if (OTP !== parsedSave.OTP) {
                if (parsedSave.failedAttempts === 2) {
                    await redisClient.del(`resetPassword:${existingUser.email}`);

                    return sendResponse(res, {
                        success: false,
                        message:
                            "Too many failed attempts. Please request a new verification code and try again.",
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
                    message: "The verification code you entered is incorrect. Please try again.",
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
                message: "We couldn't verify your code right now. Please try again in a moment.",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    setNewPasswordForResetPassword: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                identity: z.union([z.email(), z.string().regex(USERNAME)]),
                password: z.string().regex(PASSWORD, {
                    error: "Password must be 8-128 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character",
                }),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Please enter a valid email or username and a strong password.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { identity, password } = result.data;

            const existingUser = await User.findOne(
                z.string().regex(USERNAME).safeParse(identity).success
                    ? { username: identity }
                    : { email: identity }
            ).select("email passwordHash _id tokenVersion");

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "We couldn't find an account with that email or username.",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const save = await redisClient.get(`resetPassword:${existingUser.email}`);

            if (!save) {
                return sendResponse(res, {
                    success: false,
                    message: "No password reset request was found. Please request a new code.",
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
                    message: "Please verify your code before resetting your password.",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            existingUser.passwordHash = await argon2.hash(password, HASH_OPTIONS);
            existingUser.tokenVersion += 1;
            await existingUser.save();

            await redisClient.set(`userID:${existingUser._id}`, existingUser.tokenVersion, {
                expiration: {
                    type: "EX",
                    value: 1 * 60 * 60,
                },
            });

            await redisClient.del(`resetPassword:${existingUser.email}`);

            return sendResponse(res, {
                message: "Password reset successfully",
            });
        } catch (error) {
            logger.error("Error in setting new password for Reset Password");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message:
                    "We couldn't save your new password right now. Please try again in a moment.",
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
                    message: "Please enter a valid email or username and your password.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { identity, password } = result.data;

            const existingUser = await User.findOne(
                z.string().regex(USERNAME).safeParse(identity).success
                    ? { username: identity }
                    : { email: identity }
            ).lean();

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "We couldn't find an account with that email or username.",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            // Check if account is in cooldown due to failed attempts
            const cooldownStatus = await checkLoginCooldown(existingUser.email);
            if (cooldownStatus.blocked) {
                res.setHeader("Retry-After", cooldownStatus.remainingSeconds);
                return sendResponse(res, {
                    success: false,
                    message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${Math.ceil(cooldownStatus.remainingSeconds / 60)} minutes.`,
                    statusCode: StatusCodes.TOO_MANY_REQUESTS,
                    retryAfter: cooldownStatus.remainingSeconds,
                });
            }

            const match = await argon2.verify(existingUser.passwordHash, password);

            if (!match) {
                // Record failed attempt and check thresholds
                const { count, shouldWarn, shouldLockout } = await recordFailedAttempt(
                    existingUser.email
                );

                // Send warning email at threshold (3 attempts)
                if (shouldWarn) {
                    emailQueue.add(QueueNames.SEND_EMAIL, {
                        from: config.SENDER_EMAIL,
                        to: existingUser.email,
                        subject: "Failed Login Attempts on Your Account",
                        html: emailTemplates.failedLoginWarning({
                            attemptCount: count,
                            maxAttempts: loginThrottleConfig.MAX_FAILED_ATTEMPTS,
                            UAinfo: res.locals.ua,
                            locationData: res.locals.location,
                            IPAddress: res.locals.clientIP,
                        }),
                    });
                }

                // Send lockout email when max attempts reached
                if (shouldLockout) {
                    emailQueue.add(QueueNames.SEND_EMAIL, {
                        from: config.SENDER_EMAIL,
                        to: existingUser.email,
                        subject: "Your Account Has Been Temporarily Locked",
                        html: emailTemplates.accountLockout({
                            cooldownMinutes: Math.ceil(loginThrottleConfig.COOLDOWN_TTL / 60),
                            UAinfo: res.locals.ua,
                            locationData: res.locals.location,
                            IPAddress: res.locals.clientIP,
                        }),
                    });

                    return sendResponse(res, {
                        success: false,
                        message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${Math.ceil(loginThrottleConfig.COOLDOWN_TTL / 60)} minutes.`,
                        statusCode: StatusCodes.TOO_MANY_REQUESTS,
                        retryAfter: loginThrottleConfig.COOLDOWN_TTL,
                    });
                }

                return sendResponse(res, {
                    success: false,
                    message: "The email or password you entered is incorrect. Please try again.",
                    statusCode: StatusCodes.UNAUTHORIZED,
                });
            }

            // Clear failed attempts on successful login
            await clearFailedAttempts(existingUser.email);

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

            const revokePayload = {
                loginHistoryID: newLogin._id.toString(),
                expiresAt: Date.now() + REVOKE_TOKEN_EXPIRATION_TIME,
            };

            const payloadB64 = Buffer.from(JSON.stringify(revokePayload)).toString("base64url");
            const signature = crypto
                .createHmac("sha256", config.EMAIL_LOGOUT_SIGNING_KEY)
                .update(payloadB64)
                .digest("base64url");
            const revokeToken = `${payloadB64}.${signature}`;

            await emailQueue.add(QueueNames.SEND_EMAIL, {
                from: config.SENDER_EMAIL,
                to: existingUser.email,
                subject: "New Login Alert",
                html: emailTemplates.loginAlert({
                    UAinfo: res.locals.ua,
                    IPAddress: res.locals.clientIP,
                    locationData: res.locals.location,
                    emailLogoutLink: `${config.FRONTEND_URL}/email-logout?revokeToken=${revokeToken}`,
                }),
            });

            await newLogin.save();

            await redisClient.set(`userID:${existingUser._id}`, existingUser.tokenVersion, {
                expiration: {
                    type: "EX",
                    value: 1 * 60 * 60,
                },
            });

            await redisClient.set(`loginHistoryID:${newLogin._id}`, existingUser.tokenVersion, {
                expiration: {
                    type: "EX",
                    value: 1 * 60 * 60,
                },
            });

            const data = {
                ...existingUser,
                passwordHash: undefined,
                tokenVersion: undefined,
                __v: undefined,
            };

            return sendResponse(res, {
                message: "Login successful",
                data: data,
            });
        } catch (error) {
            logger.error("Error in login");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "We couldn't log you in right now. Please try again in a moment.",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    logoutMyDevice: async (_req: Request, res: Response) => {
        try {
            const { loginHistoryID } = res.locals;

            const existingLogin =
                await LoginHistory.findById(loginHistoryID).select("tokenVersion");

            // NOTE: This case should not occur as protectRoute middleware already checks for existing login
            if (!existingLogin) {
                return sendResponse(res, {
                    success: false,
                    message:
                        "We couldn't find an active session for this device. Please log in again.",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            existingLogin.tokenVersion -= 1;
            await existingLogin.save();

            await redisClient.set(`loginHistoryID:${loginHistoryID}`, existingLogin.tokenVersion, {
                expiration: {
                    type: "EX",
                    value: 1 * 60 * 60,
                },
            });

            res.clearCookie("authToken", getCookieOptions(true));

            return sendResponse(res, {
                message: "Logged out from my device successfully",
            });
        } catch (error) {
            logger.error("Error in logging out from my device");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "We couldn't log you out right now. Please try again in a moment.",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    logoutAllOtherDevices: async (_req: Request, res: Response) => {
        try {
            const { userID, loginHistoryID } = res.locals;

            const existingUser = await User.findById(userID).select("tokenVersion");
            const existingLogin =
                await LoginHistory.findById(loginHistoryID).select("tokenVersion");

            // NOTE: This case should not occur as protectRoute middleware already checks for existing user
            if (!existingUser || !existingLogin) {
                return sendResponse(res, {
                    success: false,
                    message: "We couldn't find your account. Please log in again.",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            existingUser.tokenVersion += 1;
            existingLogin.tokenVersion += 1;

            await existingUser.save();
            await existingLogin.save();

            await redisClient.set(`userID:${userID}`, existingUser.tokenVersion, {
                expiration: {
                    type: "EX",
                    value: 1 * 60 * 60,
                },
            });

            await redisClient.set(`loginHistoryID:${loginHistoryID}`, existingLogin.tokenVersion, {
                expiration: {
                    type: "EX",
                    value: 1 * 60 * 60,
                },
            });

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
                message:
                    "We couldn't log you out from all devices right now. Please try again in a moment.",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    logoutParticularDevice: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                targetLoginHistoryID: z.string().length(24),
            });

            const result = schema.safeParse(req.params);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Please provide a valid device session ID.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { targetLoginHistoryID } = result.data;
            const { tokenVersion, loginHistoryID } = res.locals;

            if (loginHistoryID === targetLoginHistoryID) {
                return sendResponse(res, {
                    success: false,
                    message:
                        "You can't log out of the device you're currently using from this page. Please use the main logout button instead.",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            const existingLogin = await LoginHistory.findOne({
                _id: targetLoginHistoryID,
                tokenVersion,
            }).select("tokenVersion");

            if (!existingLogin) {
                return sendResponse(res, {
                    success: false,
                    message:
                        "We couldn't find an active session for that device. It may have already been logged out.",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            existingLogin.tokenVersion -= 1;
            await existingLogin.save();

            await redisClient.set(
                `loginHistoryID:${targetLoginHistoryID}`,
                existingLogin.tokenVersion,
                {
                    expiration: {
                        type: "EX",
                        value: 1 * 60 * 60,
                    },
                }
            );

            return sendResponse(res, {
                message: "Logged out from particular device successfully",
            });
        } catch (error) {
            logger.error("Error in logging out from particular device");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message:
                    "We couldn't log you out from that device right now. Please try again in a moment.",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    me: async (_req: Request, res: Response) => {
        try {
            const existingUser = await User.findById(res.locals.userID).select(
                "-passwordHash -tokenVersion -__v"
            );

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "We couldn't find your account. Please log in again.",
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
                message:
                    "We couldn't load your account details right now. Please try again in a moment.",
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

            const result = schema.safeParse(req.query);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Please provide a valid session ID to view login history.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { targetLoginHistoryID } = result.data || {};
            const { tokenVersion, userID, loginHistoryID } = res.locals;

            if (typeof targetLoginHistoryID === "string") {
                const loginHistory = await LoginHistory.findById(targetLoginHistoryID)
                    .select("-__v")
                    .lean();

                if (!loginHistory) {
                    return sendResponse(res, {
                        success: false,
                        message: "We couldn't find any login history for that session.",
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
                    .lean()
                    .sort({ createdAt: -1 });

                const data = allLoginHistories.map((entry) => {
                    const parsedUA = new UAParser(entry.UA).getResult();

                    return {
                        loginHistory: entry,
                        parsedUA,
                        isActive: entry.tokenVersion === tokenVersion,
                        currentDevice: entry._id.toString() === loginHistoryID,
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
                message:
                    "We couldn't load your login history right now. Please try again in a moment.",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    checkUsernameAvailability: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                username: z.string().regex(USERNAME),
            });

            const result = schema.safeParse(req.params);

            if (!result.success) {
                return sendResponse(res, {
                    message: "Please provide a valid username to check availability.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { username } = result.data;

            const existingUser = await User.findOne({
                username,
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
                message: "We couldn't check that username right now. Please try again in a moment.",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },

    emailLogout: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                revokeToken: z.string(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    message:
                        "This logout link couldn't be processed. Please try requesting a new one.",
                    statusCode: StatusCodes.BAD_REQUEST,
                    error: z.treeifyError(result.error),
                });
            }

            const { revokeToken } = result.data;

            const [payloadB64, signature] = revokeToken.split(".");
            const expectedSignature = crypto
                .createHmac("sha256", config.EMAIL_LOGOUT_SIGNING_KEY)
                .update(payloadB64)
                .digest("base64url");
            const match = crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );

            if (!match) {
                return sendResponse(res, {
                    success: false,
                    message: "This logout link is invalid. Please try requesting a new one.",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString()) as {
                loginHistoryID: string;
                expiresAt: number;
            };

            if (Date.now() > payload.expiresAt) {
                return sendResponse(res, {
                    success: false,
                    expired: true,
                    message:
                        "This logout link has expired. You can still log out the device from your account. Please log in and go to your security settings to log out the device.",
                    statusCode: StatusCodes.BAD_REQUEST,
                });
            }

            const existingLogin = await LoginHistory.findById(payload.loginHistoryID).select(
                "tokenVersion accountID"
            );
            if (!existingLogin) {
                return sendResponse(res, {
                    success: false,
                    message:
                        "We couldn't find an active session for this logout link. The link may have already been used.",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            const existingUser = await User.findById(existingLogin.accountID).select(
                "tokenVersion"
            );
            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    message: "We couldn't find the account associated with this logout link.",
                    statusCode: StatusCodes.NOT_FOUND,
                });
            }

            if (existingUser.tokenVersion > existingLogin.tokenVersion) {
                return sendResponse(res, {
                    success: true,
                    message: "This device has already been logged out.",
                    statusCode: StatusCodes.OK,
                });
            }

            existingLogin.tokenVersion -= 1;
            await existingLogin.save();

            await redisClient.set(
                `loginHistoryID:${payload.loginHistoryID}`,
                existingLogin.tokenVersion,
                {
                    expiration: {
                        type: "EX",
                        value: 1 * 60 * 60,
                    },
                }
            );

            return sendResponse(res, {
                success: true,
                message: "Session logged out successfully",
            });
        } catch (error) {
            logger.error("Error in email logout");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                message: "We couldn't log you out right now. Please try again in a moment.",
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            });
        }
    },
};
