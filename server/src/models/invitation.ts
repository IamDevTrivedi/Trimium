import mongoose from "mongoose";
import { z } from "zod";

const invitationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            validate: {
                validator: function (v: string) {
                    return z.email().safeParse(v).success;
                },
            },
        },

        title: {
            type: String,
            minLength: 3,
            required: true,
        },

        description: {
            type: String,
            minLength: 10,
            required: true,
        },

        workspaceID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },

        permission: {
            type: String,
            enum: ["admin", "member", "viewer"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

invitationSchema.index({ workspaceID: 1 });
invitationSchema.index({ email: 1 });
invitationSchema.index({ workspaceID: 1, email: 1 });

export const Invitation = mongoose.model("Invitation", invitationSchema);
export type IInvitation = mongoose.Document & mongoose.InferSchemaType<typeof invitationSchema>;
