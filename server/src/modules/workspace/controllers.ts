import { Invitation } from "@/models/invitation";
import { User } from "@/models/user";
import { Workspace } from "@/models/workspace";
import { config } from "@config/env";
import { transporter } from "@config/mailer";
import { emailTemplates } from "@utils/emailTemplates";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

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
                            message: "All member emails must be unique (ignoring + suffix)",
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

            const exisitingUser = await User.findOne({ _id: userID });

            if (!exisitingUser) {
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
                if (member.email === exisitingUser.email) {
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

                    await transporter.sendMail({
                        to: member.email,
                        from: config.SENDER_EMAIL,
                        subject: `Invitation to join workspace: ${newWorkspace.title}`,
                        html: emailTemplates.workspaceInvitationTemplate({
                            workspaceTitle: newWorkspace.title,
                            description: newWorkspace.description,
                            permission: member.permission,
                            senderName: `${exisitingUser.firstName} ${exisitingUser.lastName}`,
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

            const exisitingUser = await User.findById(userID).lean();

            if (!exisitingUser) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.UNAUTHORIZED,
                    message: "User not found",
                });
            }

            const invitations = await Invitation.find({ email: exisitingUser.email }).lean();

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Invitations fetched successfully",
                data: invitations.map((inv) => {
                    return {
                        title: inv.title,
                        description: inv.description,
                        updatedAt: inv.updatedAt,
                        _id: inv._id,
                        permission: inv.permission,
                    };
                }),
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

            const exisitingUser = await User.findById(userID).lean();

            if (!exisitingUser) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.UNAUTHORIZED,
                    message: "User not found",
                });
            }

            const exisitingInvitation = await Invitation.findOne({
                _id: invitationID,
                email: exisitingUser.email,
            });

            if (!exisitingInvitation) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Invitation not found",
                });
            }

            if (accept) {
                const exisitingWorkspace = await Workspace.findById(
                    exisitingInvitation.workspaceID
                );

                if (!exisitingWorkspace) {
                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.NOT_FOUND,
                        message: "Workspace not found",
                    });
                }

                const isAlreadyMember = exisitingWorkspace.members.some((member) =>
                    member.userID.equals(userID)
                );

                if (isAlreadyMember) {
                    await exisitingInvitation.deleteOne();

                    return sendResponse(res, {
                        success: true,
                        statusCode: StatusCodes.OK,
                        message: "You are already a member of this workspace",
                    });
                }

                exisitingWorkspace.members.push({
                    userID,
                    permission: exisitingInvitation.permission,
                });

                await exisitingWorkspace.save();
                await exisitingInvitation.deleteOne();

                return sendResponse(res, {
                    success: true,
                    statusCode: StatusCodes.OK,
                    message: "Invitation accepted and added to workspace",
                });
            } else {
                await exisitingInvitation.deleteOne();

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
            const workspaces = await Workspace.find({ "members.userID": userID });

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Workspaces fetched successfully",
                data: workspaces.map((ws) => {
                    return {
                        title: ws.title,
                        description: ws.description,
                        workspaceID: ws._id,
                        permission: ws.members.find((m) => m.userID.equals(userID))!.permission,
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

            const exisitingWorkspace = await Workspace.findOne({
                _id: workspaceID,
                "members.userID": userID,
            });

            if (!exisitingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found or you are not a member",
                });
            }

            const memberIndex = exisitingWorkspace.members.findIndex((member) =>
                member.userID.equals(userID)
            );

            const adminCount = exisitingWorkspace.members.reduce((count, member) => {
                return member.permission === "admin" && !member.userID.equals(userID)
                    ? count + 1
                    : count;
            }, 0);

            if (!adminCount) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message:
                        "You are the only admin in this workspace. Please assign another admin before leaving.",
                });
            }

            exisitingWorkspace.members.splice(memberIndex, 1);
            await exisitingWorkspace.save();

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

            const exisitingWorkspace = await Workspace.findOne({
                _id: workspaceID,
                "members.permission": "admin",
                "members.userID": res.locals.userID,
            });

            const exisitingUser = await User.findById(userID).lean();

            if (!exisitingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found or you do not have admin rights",
                });
            }

            if (deleteWorkspace) {
                await exisitingWorkspace.deleteOne();

                return sendResponse(res, {
                    success: true,
                    statusCode: StatusCodes.OK,
                    message: "Workspace deleted successfully",
                });
            }

            if (title) {
                exisitingWorkspace.title = title;
            }

            if (description) {
                exisitingWorkspace.description = description;
            }

            if (membersToUpdate) {
                for (const memberUpdate of membersToUpdate) {
                    const member = exisitingWorkspace.members.find((m) => {
                        return m.userID.equals(memberUpdate.memberID) && !m.userID.equals(userID);
                    });

                    if (member) {
                        member.permission = memberUpdate.permission;
                    }
                }
            }

            if (membersToRemove) {
                for (const memberID of membersToRemove) {
                    const memberIndex = exisitingWorkspace.members.findIndex((m) => {
                        return m.userID.equals(memberID) && !m.userID.equals(userID);
                    });

                    if (memberIndex !== -1) {
                        exisitingWorkspace.members.splice(memberIndex, 1);
                    }
                }
            }

            if (membersToAdd) {
                for (const member of membersToAdd) {
                    if (member.email === exisitingUser!.email) {
                        continue;
                    }

                    const exisitingMember = await User.findOne({ email: member.email });

                    if (exisitingMember) {
                        const isAlreadyMember = exisitingWorkspace.members.some((m) =>
                            m.userID.equals(exisitingMember._id)
                        );

                        if (isAlreadyMember) {
                            continue;
                        }
                    }

                    const newInvitation = await Invitation.findOneAndUpdate(
                        {
                            email: member.email,
                            workspaceID: exisitingWorkspace._id,
                        },
                        {
                            $set: {
                                permission: member.permission,
                                title: exisitingWorkspace.title,
                                description: exisitingWorkspace.description,
                            },
                        },
                        { upsert: true, new: true }
                    );

                    await newInvitation.save();

                    await transporter.sendMail({
                        to: member.email,
                        from: config.SENDER_EMAIL,
                        subject: `Invitation to join workspace: ${exisitingWorkspace.title}`,
                        html: emailTemplates.workspaceInvitationTemplate({
                            workspaceTitle: exisitingWorkspace.title,
                            description: exisitingWorkspace.description,
                            permission: member.permission,
                            senderName: `${exisitingUser!.firstName} ${exisitingUser!.lastName}`,
                        }),
                    });
                }
            }

            await exisitingWorkspace.save();

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Workspace updated successfully",
                data: {
                    workspace: exisitingWorkspace,
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

            const exisitingWorkspace = await Workspace.findOne({
                _id: workspaceID,
                "members.userID": userID,
            });

            if (!exisitingWorkspace) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Workspace not found or you are not a member",
                });
            }

            const members = await Promise.all(
                exisitingWorkspace.members.map(async (member) => {
                    const detail = await User.findById(member.userID).lean();

                    return {
                        userID: detail!._id,
                        permission: member.permission,
                        fullName: `${detail!.firstName} ${detail!.lastName}`,
                        email: detail!.email,
                        username: detail!.username,
                    };
                })
            );

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Workspace details fetched successfully",
                data: {
                    _id: exisitingWorkspace._id,
                    title: exisitingWorkspace.title,
                    description: exisitingWorkspace.description,
                    createdAt: exisitingWorkspace.createdAt,
                    members,
                },
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
};
