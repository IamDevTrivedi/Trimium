import mongoose from "mongoose";
import { z } from "zod";

const passwordProtectSchema = new mongoose.Schema(
    {
        isEnabled: {
            type: Boolean,
            default: false,
        },

        passwordHash: {
            type: String,
            default: "",
        },
    },
    {
        _id: false,
        versionKey: false,
        timestamps: false,
    }
);

const transferSchema = new mongoose.Schema(
    {
        isEnabled: {
            type: Boolean,
            default: false,
        },

        remainingTransfers: {
            type: Number,
            default: -1,
        },

        maxTransfers: {
            type: Number,
            default: -1,
        },
    },
    {
        _id: false,
        versionKey: false,
        timestamps: false,
    }
);

const scheduleSchema = new mongoose.Schema(
    {
        isEnabled: {
            type: Boolean,
            default: false,
        },

        startAt: {
            type: Date,
            default: null,
        },

        endAt: {
            type: Date,
            default: null,
        },

        countdownEnabled: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: false,
        versionKey: false,
        timestamps: false,
    }
);

const urlSchema = new mongoose.Schema(
    {
        ownerID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            default: "",
        },

        shortCode: {
            type: String,
            required: true,
            unique: true,
        },

        originalURL: {
            type: String,
            required: true,

            validate: {
                validator: (v: string) => z.url().safeParse(v).success,
                message: "Invalid URL format",
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        passwordProtect: {
            type: passwordProtectSchema,
            default: () => ({}),
        },

        transfer: {
            type: transferSchema,
            default: () => ({}),
        },

        schedule: {
            type: scheduleSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
);

export const URL = mongoose.model("URL", urlSchema);
export type IURL = mongoose.Document & mongoose.InferSchemaType<typeof urlSchema>;
