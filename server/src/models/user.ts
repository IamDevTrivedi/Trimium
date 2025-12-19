import { EMAIL, NAME, USERNAME } from "@/constants/regex";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (v: string) => NAME.test(v),
                message: "Invalid first name format",
            },
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (v: string) => NAME.test(v),
                message: "Invalid last name format",
            },
        },

        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,

            validate: {
                validator: (v: string) => USERNAME.test(v),
                message: "Invalid username format",
            },
        },

        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,

            validate: {
                validator: (v: string) => EMAIL.test(v),
                message: "Invalid email format",
            },
        },

        passwordHash: {
            type: String,
            required: true,
        },

        tokenVersion: {
            type: Number,
            required: true,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model("User", userSchema);
export type IUser = mongoose.Document & mongoose.InferSchemaType<typeof userSchema>;
