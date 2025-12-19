import mongoose from "mongoose";

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
    },
    {
        timestamps: true,
    }
);

export const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);
export type ILoginHistory = mongoose.Document & mongoose.InferSchemaType<typeof loginHistorySchema>;
