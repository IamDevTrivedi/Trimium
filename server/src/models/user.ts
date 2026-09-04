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
                message: "Please enter a valid first name.",
            },
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: (v: string) => NAME.test(v),
                message: "Please enter a valid last name.",
            },
        },

        username: {
            type: String,
            required: true,
            trim: true,
            unique: true,

            validate: {
                validator: (v: string) => USERNAME.test(v),
                message:
                    "Please choose a username that contains only letters, numbers, and underscores, starting with a letter.",
            },
        },

        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,

            validate: {
                validator: (v: string) => EMAIL.test(v),
                message: "Please enter a valid email address.",
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

userSchema.index({ email: 1, username: 1 });

export const User = mongoose.model("User", userSchema);
export type IUser = mongoose.Document & mongoose.InferSchemaType<typeof userSchema>;
