import mongoose from "mongoose";
import { z } from "zod";

const loginHistorySchema = new mongoose.Schema(
    {
        accountID: {
            type: mongoose.Types.ObjectId,
            required: true,
        },

        UA: {
            type: String,
            required: true,
        },

        tokenVersion: {
            type: Number,
            required: true,
        },

        IPAddress: {
            type: String,
            required: true,
            validate: {
                validator: (v: string) => {
                    return z.ipv4().safeParse(v).success;
                },
            },
        },

        lat: {
            type: Number,
            required: true,
        },

        lon: {
            type: Number,
            required: true,
        },

        displayName: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

loginHistorySchema.index({ accountID: 1 });
loginHistorySchema.index({ accountID: 1, createdAt: -1 });

export const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);
export type ILoginHistory = mongoose.Document & mongoose.InferSchemaType<typeof loginHistorySchema>;
