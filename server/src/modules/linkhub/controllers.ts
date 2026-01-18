import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { sendResponse } from "@utils/sendResponse";
import { logger } from "@utils/logger";
import { Linkhub, LINKHUB_THEMES } from "@/models/linkhub";
import { User } from "@/models/user";

const linkSchema = z.object({
    id: z.string().min(1).max(50),
    title: z.string().min(1).max(100),
    url: z.url().max(2048),
    isActive: z.boolean(),
});

const socialsSchema = z.object({
    instagram: z.string().max(100).optional().or(z.literal("")),
    linkedin: z.string().max(100).optional().or(z.literal("")),
    github: z.string().max(100).optional().or(z.literal("")),
    x: z.string().max(100).optional().or(z.literal("")),
    youtube: z.string().max(100).optional().or(z.literal("")),
    tiktok: z.string().max(100).optional().or(z.literal("")),
    portfolio: z.string().max(2048).optional().or(z.literal("")),
    email: z.email().max(320).optional().or(z.literal("")),
});

const updateLinkhubSchema = z.object({
    title: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.url().max(2048).optional().or(z.literal("")),
    links: z.array(linkSchema).max(20).optional(),
    socials: socialsSchema.optional(),
    theme: z.enum(LINKHUB_THEMES).optional(),
    isPublished: z.boolean().optional(),
});

export const controllers = {
    getMyLinkhub: async (req: Request, res: Response) => {
        try {
            const { userID } = res.locals;

            let linkhub = await Linkhub.findOne({ userID });

            if (!linkhub) {
                const user = await User.findById(userID).select("firstName lastName");

                linkhub = await Linkhub.create({
                    userID,
                    title: user ? `${user.firstName} ${user.lastName}` : "",
                    bio: "",
                    links: [],
                    socials: {},
                    theme: "midnight",
                    isPublished: false,
                });
            }

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Linkhub profile retrieved",
                data: linkhub,
            });
        } catch (error) {
            logger.error("Error in getMyLinkhub controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    updateMyLinkhub: async (req: Request, res: Response) => {
        try {
            const { userID } = res.locals;

            const result = updateLinkhubSchema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    data: z.treeifyError(result.error),
                });
            }

            const updateData = result.data;

            if (updateData.socials) {
                Object.keys(updateData.socials).forEach((key) => {
                    const socialKey = key as keyof typeof updateData.socials;
                    if (updateData.socials![socialKey] === "") {
                        updateData.socials![socialKey] = undefined;
                    }
                });
            }

            const linkhub = await Linkhub.findOneAndUpdate(
                { userID },
                { $set: updateData },
                { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Linkhub profile updated",
                data: linkhub,
            });
        } catch (error) {
            logger.error("Error in updateMyLinkhub controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    getPublicLinkhub: async (req: Request, res: Response) => {
        try {
            const { username } = req.params;

            if (!username || typeof username !== "string") {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Username is required",
                });
            }

            const user = await User.findOne({ username }).select("_id firstName lastName username");

            if (!user) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Profile not found",
                });
            }

            const linkhub = await Linkhub.findOne({
                userID: user._id,
                isPublished: true,
            });

            if (!linkhub) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Profile not found or not published",
                });
            }

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Linkhub profile retrieved",
                data: {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    title: linkhub.title,
                    bio: linkhub.bio,
                    avatarUrl: linkhub.avatarUrl,
                    links: linkhub.links.filter((link) => link.isActive),
                    socials: linkhub.socials,
                    theme: linkhub.theme,
                },
            });
        } catch (error) {
            logger.error("Error in getPublicLinkhub controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },
};
