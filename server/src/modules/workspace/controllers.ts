import { getWorkspacePerformance } from "@utils/getWorkspacePerformance";
import { User } from "@/models/user";
import { Workspace } from "@/models/workspace";
import { config } from "@config/env";
import { emailTemplates } from "@utils/emailTemplates";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { DEFAULT_TAG, TAGS_ID_RANGE } from "@/constants/tags";
import { TAGS, TAGS_NOTICE, SHORTCODE, SHORTCODE_NOTICE } from "@/constants/regex";
import { Invitation } from "@/models/invitation";
import { URL } from "@/models/url";
import { Analytics } from "@/models/analytics";
import mongoose from "mongoose";
import { emailQueue } from "@modules/queue/queues";

export const controllers = {
    createWorkspace: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                title: z.string().min(3, "Title must be at least 3 characters long"),
                description: z.string().min(10, "Description must be at least 10 characters long"),

                members: z
                    .array(
                        z.object({
                            email: z.email(),
                            permission: z.enum(["admin", "member", "viewer"]),
                        })
                    )
                    .refine(
                        (members) => {
                            const normalized = members.map((m) => m.email);
                            return new Set(normalized).size === normalized.length;
                        },
                        {
                            message: "All member emails must be unique",
                            path: ["members"],
                        }
                    ),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { title, description, members } = result.data;
            const { userID } = res.locals;

            const existingUser = await User.findById(userID)
                .select("email firstName lastName")
                .lean();

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.UNAUTHORIZED,
                    message: "User not found",
                });
            }

            const newWorkspace = new Workspace({
                title,
                description,
                members: [
                    {
                        userID,
                        permission: "admin",
                    },
                ],
            });

            await newWorkspace.save();

            for (const member of members) {
                if (member.email === existingUser.email) {
                    continue;
                }

                try {
                    const newInvitation = await Invitation.findOneAndUpdate(
                        { email: member.email, workspaceID: newWorkspace._id },
                        {
                            $set: {
                                permission: member.permission,
                                title: newWorkspace.title,
                                description: newWorkspace.description,
                            },
                        },
                        { upsert: true, new: true }
                    );

                    await newInvitation.save();

                    await emailQueue.add("emailQueue", {
                        to: member.email,
                        from: config.SENDER_EMAIL,
                        subject: `Invitation to join workspace: ${newWorkspace.title}`,
                        html: emailTemplates.workspaceInvitationTemplate({
                            workspaceTitle: newWorkspace.title,
                            description: newWorkspace.description,
                            permission: member.permission,
                            senderName: `${existingUser.firstName} ${existingUser.lastName}`,
                        }),
                    });
                } catch (error) {
                    logger.error(`Error processing member with email ${member.email}:`);
                    logger.error(error);
                }
            }

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.CREATED,
                message: "Workspace created successfully",
                data: {
                    workspace: newWorkspace,
                },
            });
        } catch (error) {
            logger.error("Error in createWorkspace controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    getAllInvitations: async (req: Request, res: Response) => {
        try {
            const { userID } = res.locals;

            const existingUser = await User.findById(userID).select("email").lean();

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.UNAUTHORIZED,
                    message: "User not found",
                });
            }

            const invitations = await Invitation.find({ email: existingUser.email })
                .select("title description updatedAt permission")
                .lean();

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Invitations fetched successfully",
                data: invitations.map((inv) => ({
                    ...inv,
                    _id: inv._id,
                })),
            });
        } catch (error) {
            logger.error("Error in getAllInvitations controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    acceptORDeclineInvitation: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                invitationID: z.string().length(24, "Invalid invitation ID"),
                accept: z.boolean(),
            });

            const result = schema.safeParse(req.body);
            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { invitationID, accept } = result.data;
            const { userID } = res.locals;

            const existingUser = await User.findById(userID).select("email").lean();

            if (!existingUser) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.UNAUTHORIZED,
                    message: "User not found",
                });
            }

            const existingInvitation = await Invitation.findOne({
                _id: invitationID,
                email: existingUser.email,
            });

            if (!existingInvitation) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Invitation not found",
                });
            }

            if (accept) {
                const existingWorkspace = await Workspace.findById(existingInvitation.workspaceID);

                if (!existingWorkspace) {
                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.NOT_FOUND,
                        message: "Workspace not found",
                    });
                }

                const isAlreadyMember = existingWorkspace.members.some((member) =>
                    member.userID.equals(userID)
                );

                if (isAlreadyMember) {
                    await existingInvitation.deleteOne();

                    return sendResponse(res, {
                        success: true,
                        statusCode: StatusCodes.OK,
                        message: "You are already a member of this workspace",
                    });
                }

                existingWorkspace.members.push({
                    userID,
                    permission: existingInvitation.permission,
                });

                await existingWorkspace.save();
                await existingInvitation.deleteOne();

                return sendResponse(res, {
                    success: true,
                    statusCode: StatusCodes.OK,
                    message: "Invitation accepted and added to workspace",
                });
            } else {
                await existingInvitation.deleteOne();

                return sendResponse(res, {
                    success: true,
                    statusCode: StatusCodes.OK,
                    message: "Invitation declined successfully",
                });
            }
        } catch (error) {
            logger.error("Error in acceptORDeclineInvitation controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    getMyWorkspaces: async (req: Request, res: Response) => {
        try {
            const { userID } = res.locals;
            const workspaces = await Workspace.find({ "members.userID": userID })
                .select("title description members createdAt")
                .lean();

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Workspaces fetched successfully",
                data: workspaces.map((ws) => {
                    return {
                        title: ws.title,
                        description: ws.description,
                        workspaceID: ws._id,
                        permission: ws.members.find((m) => m.userID.toString() === userID)!
                            .permission,
                        createdAt: ws.createdAt,
                        size: ws.members.length,
                    };
                }),
            });
        } catch (error) {
            logger.error("Error in getMyWorkspaces controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    leaveWorkspace: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                workspaceID: z.string().length(24, "Invalid workspace ID"),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { workspaceID } = result.data;
            const { userID } = res.locals;

            const existingWorkspace = await Workspace.findOne({
                _id: workspaceID,
            });

            if (!existingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found or you are not a member",
                });
            }

            const memberIndex = existingWorkspace.members.findIndex((member) =>
                member.userID.equals(userID)
            );

            if (memberIndex === -1) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found or you are not a member",
                });
            }

            const adminCount = existingWorkspace.members.reduce((count, member) => {
                return member.permission === "admin" && !member.userID.equals(userID)
                    ? count + 1
                    : count;
            }, 0);

            if (!adminCount) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message:
                        "You are the only admin in this workspace. Please assign another admin before leaving or delete the workspace.",
                });
            }

            existingWorkspace.members.splice(memberIndex, 1);
            await existingWorkspace.save();

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Left workspace successfully",
            });
        } catch (error) {
            logger.error("Error in leaveWorkspace controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    sudoUpdateWorkspace: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                workspaceID: z.string().length(24, "Invalid workspace ID"),
                title: z.string().min(3, "Title must be at least 3 characters long").optional(),
                description: z
                    .string()
                    .min(10, "Description must be at least 10 characters long")
                    .optional(),

                membersToUpdate: z
                    .object({
                        memberID: z.string().length(24, "Invalid member ID"),
                        permission: z.enum(["admin", "member", "viewer"]),
                    })
                    .array()
                    .optional(),

                membersToAdd: z
                    .object({
                        email: z.email(),
                        permission: z.enum(["admin", "member", "viewer"]),
                    })
                    .array()
                    .optional(),

                membersToRemove: z.string().length(24, "Invalid member ID").array().optional(),

                deleteWorkspace: z.boolean().optional(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid Request",
                    success: false,
                    errors: z.treeifyError(result.error),
                });
            }

            const {
                workspaceID,
                title,
                description,
                membersToAdd,
                membersToUpdate,
                membersToRemove,
                deleteWorkspace,
            } = result.data;
            const { userID } = res.locals;

            const existingWorkspace = await Workspace.findById(workspaceID);

            const existingUser = await User.findById(userID)
                .select("firstName lastName email")
                .lean();

            if (!existingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found",
                });
            }

            const isAdmin = existingWorkspace.members.some(
                (m) => m.userID.equals(userID) && m.permission === "admin"
            );

            if (!isAdmin) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.FORBIDDEN,
                    message: "You do not have admin rights to perform this action",
                });
            }

            if (deleteWorkspace) {
                const session = await mongoose.startSession();
                try {
                    if (config.isProduction) {
                        await session.withTransaction(async () => {
                            await existingWorkspace.deleteOne({ session });
                            await Invitation.deleteMany({ workspaceID }, { session });
                            await URL.deleteMany({ workspaceID }, { session });
                            await Analytics.deleteMany({ workspaceID }, { session });
                        });
                    } else {
                        await existingWorkspace.deleteOne();
                        await Invitation.deleteMany({ workspaceID });
                        await URL.deleteMany({ workspaceID });
                        await Analytics.deleteMany({ workspaceID });
                    }

                    return sendResponse(res, {
                        success: true,
                        statusCode: StatusCodes.OK,
                        message: "Workspace deleted successfully",
                    });
                } catch (error) {
                    logger.error("Error deleting workspace in transaction:");
                    logger.error(error);

                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                        message: "Failed to delete workspace",
                    });
                } finally {
                    await session.endSession();
                }
            }

            if (title) {
                existingWorkspace.title = title;
            }

            if (description) {
                existingWorkspace.description = description;
            }

            if (membersToUpdate) {
                for (const memberUpdate of membersToUpdate) {
                    const member = existingWorkspace.members.find((m) => {
                        return m.userID.equals(memberUpdate.memberID) && !m.userID.equals(userID);
                    });

                    if (member) {
                        member.permission = memberUpdate.permission;
                    }
                }
            }

            if (membersToRemove) {
                for (const memberID of membersToRemove) {
                    const memberIndex = existingWorkspace.members.findIndex((m) => {
                        return m.userID.equals(memberID) && !m.userID.equals(userID);
                    });

                    if (memberIndex !== -1) {
                        existingWorkspace.members.splice(memberIndex, 1);
                    }
                }
            }

            if (membersToAdd) {
                for (const member of membersToAdd) {
                    if (member.email === existingUser!.email) {
                        continue;
                    }

                    const existingMember = await User.findOne({ email: member.email })
                        .select("_id")
                        .lean();

                    if (existingMember) {
                        const isAlreadyMember = existingWorkspace.members.some((m) =>
                            m.userID.equals(existingMember._id)
                        );

                        if (isAlreadyMember) {
                            continue;
                        }
                    }

                    const newInvitation = await Invitation.findOneAndUpdate(
                        {
                            email: member.email,
                            workspaceID: existingWorkspace._id,
                        },
                        {
                            $set: {
                                permission: member.permission,
                                title: existingWorkspace.title,
                                description: existingWorkspace.description,
                            },
                        },
                        { upsert: true, new: true }
                    );

                    await newInvitation.save();

                    await emailQueue.add("emailQueue", {
                        to: member.email,
                        from: config.SENDER_EMAIL,
                        subject: `Invitation to join workspace: ${existingWorkspace.title}`,
                        html: emailTemplates.workspaceInvitationTemplate({
                            workspaceTitle: existingWorkspace.title,
                            description: existingWorkspace.description,
                            permission: member.permission,
                            senderName: `${existingUser!.firstName} ${existingUser!.lastName}`,
                        }),
                    });
                }
            }

            await existingWorkspace.save();

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Workspace updated successfully",
                data: {
                    workspace: existingWorkspace,
                },
            });
        } catch (error) {
            logger.error("Error in sudoUpdateWorkspace controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    getWorkspaceDetails: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                workspaceID: z.string().length(24, "Invalid workspace ID"),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { workspaceID } = result.data;
            const { userID } = res.locals;

            const existingWorkspace = await Workspace.findOne({
                _id: workspaceID,
            });

            if (!existingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found",
                });
            }

            const isMember = existingWorkspace.members.some((m) => m.userID.equals(userID));

            if (!isMember) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.FORBIDDEN,
                    message: "You are not a member of this workspace",
                });
            }

            const members = await Promise.all(
                existingWorkspace.members.map(async (member) => {
                    const detail = await User.findById(member.userID)
                        .select("firstName lastName email username")
                        .lean();

                    return {
                        userID: detail!._id,
                        permission: member.permission,
                        fullName: `${detail!.firstName} ${detail!.lastName}`,
                        email: detail!.email,
                        username: detail!.username,
                    };
                })
            );

            const workspacePerformance = await getWorkspacePerformance(workspaceID);

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Workspace details fetched successfully",
                workspaceDetails: {
                    _id: existingWorkspace._id,
                    title: existingWorkspace.title,
                    description: existingWorkspace.description,
                    createdAt: existingWorkspace.createdAt,
                    members,
                },
                workspacePerformance: workspacePerformance,
            });
        } catch (error) {
            logger.error("Error in getWorkspaceDetails controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    workspacePermission: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                workspaceID: z.string().length(24, "Invalid workspace ID"),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { workspaceID } = result.data;
            const { userID } = res.locals;

            const existingWorkspace = await Workspace.findById(workspaceID)
                .select("members")
                .lean();

            if (!existingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found",
                    data: {
                        permission: null,
                        partOf: false,
                    },
                });
            }

            const member = existingWorkspace.members.find((m) => m.userID.toString() === userID);

            if (!member) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.FORBIDDEN,
                    message: "You are not a member of this workspace",
                    data: { permission: null, partOf: false },
                });
            }

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Workspace permission fetched successfully",
                data: {
                    permission: member.permission,
                    partOf: true,
                },
            });
        } catch (error) {
            logger.error("Error in workspacePermission controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
                data: { permission: null, partOf: false },
            });
        }
    },

    createTag: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                workspaceID: z.string().length(24, "Invalid workspace ID"),
                tag: z.string().regex(TAGS, TAGS_NOTICE),
                tagID: z.int().positive().max(TAGS_ID_RANGE).optional().default(DEFAULT_TAG.id),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { workspaceID, tag, tagID } = result.data;
            const { userID } = res.locals;

            const existingWorkspace = await Workspace.findById(workspaceID).select("tags members");

            if (!existingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found",
                });
            }

            const member = existingWorkspace.members.find((m) => m.userID.equals(userID));

            if (!member || member.permission === "viewer") {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.FORBIDDEN,
                    message: "You do not have permission to create tags in this workspace",
                });
            }

            if (existingWorkspace.tags.has(tag)) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.CONFLICT,
                    message: "Tag already exists in this workspace",
                });
            }

            existingWorkspace.tags.set(tag, tagID);
            await existingWorkspace.save();

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.CREATED,
                message: "Tag created successfully",
            });
        } catch (error) {
            logger.error("Error in createNewTag controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    updateTag: async (req: Request, res: Response) => {
        try {
            const schema = z
                .object({
                    workspaceID: z.string().length(24, "Invalid workspace ID"),
                    oldTag: z.string().regex(TAGS, TAGS_NOTICE),
                    newTag: z.string().regex(TAGS, TAGS_NOTICE).optional(),
                    newTagID: z.number().int().positive().max(TAGS_ID_RANGE).optional(),
                })
                .refine(
                    (data) => {
                        return data.newTag || data.newTagID;
                    },
                    {
                        message: "At least one of newTag or newTagID must be provided",
                    }
                );

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { workspaceID, oldTag, newTag, newTagID } = result.data;
            const { userID } = res.locals;

            const existingWorkspace = await Workspace.findById(workspaceID).select("tags members");

            if (!existingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found",
                });
            }

            const member = existingWorkspace.members.find((m) => m.userID.equals(userID));

            if (!member || member.permission === "viewer") {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.FORBIDDEN,
                    message: "You do not have permission to update tags in this workspace",
                });
            }

            if (!existingWorkspace.tags.has(oldTag)) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Tag not found in this workspace",
                });
            }

            if (!newTag && newTagID) {
                existingWorkspace.tags.set(oldTag, newTagID);
                await existingWorkspace.save();
            } else if (newTag) {
                if (existingWorkspace.tags.has(newTag)) {
                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.CONFLICT,
                        message: "New tag already exists in this workspace",
                    });
                }

                const tagValue = existingWorkspace.tags.get(oldTag)!;
                existingWorkspace.tags.delete(oldTag);
                existingWorkspace.tags.set(newTag, tagValue);

                if (newTagID) {
                    existingWorkspace.tags.set(newTag, newTagID);
                }

                await existingWorkspace.save();

                await URL.updateMany(
                    {
                        workspaceID,
                        tags: oldTag,
                    },
                    [
                        {
                            $set: {
                                tags: {
                                    $concatArrays: [
                                        {
                                            $filter: {
                                                input: "$tags",
                                                cond: { $ne: ["$$this", oldTag] },
                                            },
                                        },
                                        [newTag],
                                    ],
                                },
                            },
                        },
                    ],
                    {
                        updatePipeline: true,
                    }
                );
            }

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Tag updated successfully",
            });
        } catch (error) {
            logger.error("Error in updateTag controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    deleteTag: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                workspaceID: z.string().length(24, "Invalid workspace ID"),
                tag: z.string().regex(TAGS, TAGS_NOTICE),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { workspaceID, tag } = result.data;
            const { userID } = res.locals;

            const existingWorkspace = await Workspace.findById(workspaceID).select("tags members");

            if (!existingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found",
                });
            }

            const member = existingWorkspace.members.find((m) => m.userID.equals(userID));

            if (!member || member.permission === "viewer") {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.FORBIDDEN,
                    message: "You do not have permission to delete tags in this workspace",
                });
            }

            if (!existingWorkspace.tags.has(tag)) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Tag not found in this workspace",
                });
            }

            existingWorkspace.tags.delete(tag);
            await existingWorkspace.save();

            await URL.updateMany({ workspaceID }, { $pull: { tags: tag } });

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Tag deleted successfully",
            });
        } catch (error) {
            logger.error("Error in deleteTag controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    getTags: async (req: Request, res: Response) => {
        try {
            const schema = z
                .object({
                    workspaceID: z.string().length(24, "Invalid workspace ID").optional(),
                    shortCode: z.string().regex(SHORTCODE, SHORTCODE_NOTICE).optional(),
                })
                .refine(
                    (data) => {
                        return data.workspaceID || data.shortCode;
                    },
                    {
                        message: "Either workspaceID or shortCode must be provided",
                    }
                );

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { workspaceID, shortCode } = result.data;
            const { userID } = res.locals;

            if (workspaceID) {
                const existingWorkspace = await Workspace.findById(workspaceID)
                    .select("tags members")
                    .lean();

                if (!existingWorkspace) {
                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.NOT_FOUND,
                        message: "Workspace not found",
                    });
                }

                const member = existingWorkspace.members.find(
                    (m) => m.userID.toString() === userID
                );

                if (!member) {
                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.FORBIDDEN,
                        message: "You do not have access to this workspace",
                    });
                }

                return sendResponse(res, {
                    success: true,
                    statusCode: StatusCodes.OK,
                    message: "Tags fetched successfully",
                    data: Object.entries(existingWorkspace.tags).map(([tag, tagID]) => ({
                        tag,
                        tagID,
                    })),
                });
            } else {
                const existingURL = await URL.findOne({
                    shortCode: shortCode,
                })
                    .select("workspaceID tags")
                    .lean();

                if (!existingURL) {
                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.NOT_FOUND,
                        message: "URL not found",
                    });
                }

                const existingWorkspace = await Workspace.findById(existingURL.workspaceID)
                    .select("tags members")
                    .lean();

                if (!existingWorkspace) {
                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.NOT_FOUND,
                        message: "Workspace not found",
                    });
                }

                const member = existingWorkspace.members.find(
                    (m) => m.userID.toString() === userID
                );

                if (!member) {
                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.FORBIDDEN,
                        message: "You do not have access to this workspace",
                    });
                }

                return sendResponse(res, {
                    success: true,
                    statusCode: StatusCodes.OK,
                    message: "Tags fetched successfully",
                    data: existingURL.tags.map((tag) => {
                        return {
                            tag,
                            tagID: existingWorkspace.tags[tag],
                        };
                    }),
                });
            }
        } catch (error) {
            logger.error("Error in getTags controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },

    setTagsToShortcode: async (req: Request, res: Response) => {
        try {
            const schema = z
                .object({
                    shortCode: z.string().regex(SHORTCODE, SHORTCODE_NOTICE),
                    tagsToAdd: z.string().regex(TAGS, TAGS_NOTICE).array().optional(),
                    tagsToRemove: z.string().regex(TAGS, TAGS_NOTICE).array().optional(),
                })
                .refine(
                    (data) => {
                        return data.tagsToAdd?.length || data.tagsToRemove?.length;
                    },
                    {
                        message: "At least one of tagsToAdd or tagsToRemove must be provided",
                    }
                );

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { shortCode, tagsToAdd, tagsToRemove } = result.data;
            const { userID } = res.locals;

            const existingURL = await URL.findOne({ shortCode });

            if (!existingURL) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "URL not found",
                });
            }

            const existingWorkspace = await Workspace.findById(existingURL.workspaceID).select(
                "tags members"
            );

            if (!existingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found",
                });
            }

            const member = existingWorkspace.members.find((m) => m.userID.equals(userID));

            if (!member || member.permission === "viewer") {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.FORBIDDEN,
                    message: "You do not have permission to modify tags in this workspace",
                });
            }

            const alreadyPresentTags = new Set(existingURL.tags);
            if (typeof tagsToAdd !== "undefined") {
                for (const tag of tagsToAdd) {
                    if (alreadyPresentTags.has(tag)) {
                        return sendResponse(res, {
                            success: false,
                            statusCode: StatusCodes.CONFLICT,
                            message: `Tag "${tag}" already exists on this shortcode`,
                        });
                    } else if (existingWorkspace.tags.has(tag) === false) {
                        return sendResponse(res, {
                            success: false,
                            statusCode: StatusCodes.BAD_REQUEST,
                            message: `Tag "${tag}" does not exist in the workspace`,
                        });
                    } else {
                        alreadyPresentTags.add(tag);
                        existingURL.tags.push(tag);
                    }
                }
            }

            if (typeof tagsToRemove !== "undefined") {
                for (const tag of tagsToRemove) {
                    if (!alreadyPresentTags.has(tag)) {
                        return sendResponse(res, {
                            success: false,
                            statusCode: StatusCodes.NOT_FOUND,
                            message: `Tag "${tag}" does not exist on this shortcode`,
                        });
                    } else if (existingWorkspace.tags.has(tag) === false) {
                        return sendResponse(res, {
                            success: false,
                            statusCode: StatusCodes.BAD_REQUEST,
                            message: `Tag "${tag}" does not exist in the workspace`,
                        });
                    } else {
                        alreadyPresentTags.delete(tag);
                        existingURL.tags = existingURL.tags.filter((t) => t !== tag);
                    }
                }
            }

            await existingURL.save();

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Tags updated successfully",
            });
        } catch (error) {
            logger.error("Error in setTagsToShortcode controller:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal Server Error",
            });
        }
    },
};
