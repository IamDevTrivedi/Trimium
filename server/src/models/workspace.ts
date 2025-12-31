import mongoose from "mongoose";

const membersSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        permission: {
            type: String,
            enum: ["admin", "member", "viewer"],
            required: true,
        },
    },
    {
        _id: false,
        versionKey: false,
        timestamps: false,
    }
);

const workspaceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            minlength: 3,
        },

        description: {
            type: String,
            required: true,
            minlength: 10,
        },

        members: {
            type: [membersSchema],
            default: [],
        },

        tags: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

export const Workspace = mongoose.model("Workspace", workspaceSchema);
export type IWorkspace = mongoose.Document & mongoose.InferSchemaType<typeof workspaceSchema>;
