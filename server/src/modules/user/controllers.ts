import {
    NAME,
    NAME_NOTICE,
    PASSWORD,
    PASSWORD_NOTICE,
    USERNAME,
    USERNAME_NOTICE,
} from "@/constants/regex";
import { User } from "@/models/user";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import bcrypt from "bcrypt";

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
                    message: "Invalid request data",
                    data: z.treeifyError(result.error),
                });
            }

            const { firstName, lastName } = result.data;
            const { userID } = res.locals;

            const existingUser = await User.findById(userID).select(
                "-passwordHash -tokenVersion -__v"
            );

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "User not found",
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
                message: "Internal Server Error",
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
                    message: "Invalid request data",
                    data: z.treeifyError(result.error),
                });
            }

            const { currentPassword, newPassword } = result.data;
            const { userID } = res.locals;

            const existingUser = await User.findById(userID);

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "User not found",
                });
            }

            const match = await bcrypt.compare(currentPassword, existingUser.passwordHash);

            if (!match) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.UNAUTHORIZED,
                    message: "Current password is incorrect",
                });
            }

            const passwordHash = await bcrypt.hash(newPassword, 14);
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
                message: "Internal Server Error",
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
                    message: "Invalid request data",
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
                    message: "User not found",
                });
            }

            const usernameTaken = await User.findOne({ username: newUsername }).select("_id");

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
                message: "Internal Server Error",
            });
        }
    },
};
