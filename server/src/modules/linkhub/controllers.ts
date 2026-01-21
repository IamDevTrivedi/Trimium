import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { sendResponse } from "@utils/sendResponse";
import { logger } from "@utils/logger";
import { Linkhub, LINKHUB_THEMES } from "@/models/linkhub";
import { User } from "@/models/user";
import { cloudinary } from "@/config/cloudinary";
import { USERNAME, USERNAME_NOTICE } from "@/constants/regex";

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

            const schema = z.object({
                title: z.string().max(100).optional(),
                bio: z.string().max(500).optional(),
                avatarUrl: z.url().max(2048).optional().or(z.literal("")),
                links: z
                    .array(
                        z.object({
                            id: z.string().min(1).max(50),
                            title: z.string().min(1).max(100),
                            url: z.url().max(2048),
                            isActive: z.boolean(),
                        })
                    )
                    .max(20)
                    .optional(),
                socials: z
                    .object({
                        instagram: z.string().max(100).optional().or(z.literal("")),
                        linkedin: z.string().max(100).optional().or(z.literal("")),
                        github: z.string().max(100).optional().or(z.literal("")),
                        x: z.string().max(100).optional().or(z.literal("")),
                        youtube: z.string().max(100).optional().or(z.literal("")),
                        tiktok: z.string().max(100).optional().or(z.literal("")),
                        portfolio: z.string().max(2048).optional().or(z.literal("")),
                        email: z.email().max(320).optional().or(z.literal("")),
                    })
                    .optional(),
                theme: z.enum(LINKHUB_THEMES).optional(),
                isPublished: z.boolean().optional(),
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
            const schema = z.object({
                username: z.string().regex(USERNAME, USERNAME_NOTICE),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid username",
                    data: z.treeifyError(result.error),
                });
            }

            const { username } = result.data;

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

    uploadAvatar: async (req: Request, res: Response) => {
        try {
            const { userID } = res.locals;

            if (!req.file) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "No file uploaded",
                });
            }

            const existingLinkhub = await Linkhub.findOne({ userID });
            const existingAvatarUrl = existingLinkhub?.avatarUrl;

            if (existingAvatarUrl && existingAvatarUrl.includes("cloudinary")) {
                try {
                    const urlParts = existingAvatarUrl.split("/");
                    const publicIdWithExtension = urlParts[urlParts.length - 1];
                    const publicId = `linkhub-avatars/${publicIdWithExtension.split(".")[0]}`;
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    logger.warn("Failed to delete old avatar from Cloudinary:");
                    logger.warn(error);
                }
            }

            const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
                (resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: "linkhub-avatars",
                            transformation: [
                                { width: 400, height: 400, crop: "fill", gravity: "face" },
                                { quality: "auto", fetch_format: "auto" },
                            ],
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result as { secure_url: string; public_id: string });
                        }
                    );
                    uploadStream.end(req.file!.buffer);
                }
            );

            await Linkhub.findOneAndUpdate(
                { userID },
                { $set: { avatarUrl: uploadResult.secure_url } },
                { upsert: true }
            );

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Avatar uploaded successfully",
                data: {
                    url: uploadResult.secure_url,
                },
            });
        } catch (error) {
            logger.error("Error in uploadAvatar controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to upload avatar",
            });
        }
    },
};
