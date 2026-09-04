import {
    NAME,
    NAME_NOTICE,
    PASSWORD,
    PASSWORD_NOTICE,
    USERNAME,
    USERNAME_NOTICE,
} from "@/constants/regex";
import { HASH_OPTIONS } from "@config/argon2";
import { User } from "@/models/user";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import argon2 from "argon2";

export const controllers = {
    changeName: async (req: Request, res: Response) => {
        try {
            const schema = z
                .object({
                    firstName: z.string().regex(NAME, {
                        error: NAME_NOTICE,
                    }),
                    lastName: z.string().regex(NAME, {
                        error: NAME_NOTICE,
                    }),
                })
                .strict();

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Please enter a valid first name and last name.",
                    data: z.treeifyError(result.error),
                });
            }

            const { firstName, lastName } = result.data;
            const { userID } = res.locals;

            const existingUser = await User.findById(userID).select(
                "firstName lastName email username createdAt updatedAt"
            );

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "We couldn't find your account. Please log in again.",
                });
            }

            existingUser.firstName = firstName;
            existingUser.lastName = lastName;

            await existingUser.save();

            return sendResponse(res, {
                success: true,
                message: "Name changed successfully",
                statusCode: StatusCodes.OK,
                data: existingUser,
            });
        } catch (error) {
            logger.error("Error in changeName controller: ");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "We couldn't update your name right now. Please try again in a moment.",
            });
        }
    },

    changePassword: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                currentPassword: z.string().regex(PASSWORD, {
                    error: PASSWORD_NOTICE,
                }),
                newPassword: z.string().regex(PASSWORD, {
                    error: PASSWORD_NOTICE,
                }),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Please enter a strong current and new password.",
                    data: z.treeifyError(result.error),
                });
            }

            const { currentPassword, newPassword } = result.data;
            const { userID } = res.locals;

            const existingUser = await User.findById(userID).select("passwordHash");

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "We couldn't find your account. Please log in again.",
                });
            }

            const match = await argon2.verify(existingUser.passwordHash, currentPassword);

            if (!match) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.UNAUTHORIZED,
                    message: "The current password you entered is incorrect. Please try again.",
                });
            }

            const passwordHash = await argon2.hash(newPassword, HASH_OPTIONS);
            existingUser.passwordHash = passwordHash;
            await existingUser.save();

            return sendResponse(res, {
                success: true,
                message: "Password changed successfully",
                statusCode: StatusCodes.OK,
            });
        } catch (error) {
            logger.error("Error in changePassword controller: ");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message:
                    "We couldn't update your password right now. Please try again in a moment.",
            });
        }
    },

    changeUsername: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                newUsername: z.string().regex(USERNAME, {
                    error: USERNAME_NOTICE,
                }),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Please enter a valid username.",
                    data: z.treeifyError(result.error),
                });
            }

            const { newUsername } = result.data;
            const { userID } = res.locals;

            const existingUser = await User.findById(userID).select("username");

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "We couldn't find your account. Please log in again.",
                });
            }

            const usernameTaken = await User.findOne({ username: newUsername })
                .select("_id")
                .lean();

            if (usernameTaken) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.CONFLICT,
                    message: "Username is already taken",
                });
            }

            existingUser.username = newUsername;
            await existingUser.save();

            return sendResponse(res, {
                success: true,
                message: "Username changed successfully",
                statusCode: StatusCodes.OK,
                data: { username: newUsername },
            });
        } catch (error) {
            logger.error("Error in changeUsername controller: ");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message:
                    "We couldn't update your username right now. Please try again in a moment.",
            });
        }
    },
};
