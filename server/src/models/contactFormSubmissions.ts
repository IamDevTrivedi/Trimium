import mongoose from "mongoose";
import { z } from "zod";

const contactFormSubmissionSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 2,
        },

        lastName: {
            type: String,
            required: true,
            minLength: 2,
        },

        email: {
            type: String,
            required: true,
            validate: {
                validator: (email: string) => z.email().safeParse(email).success,
                message: "Invalid email address",
            },
        },

        subject: {
            type: String,
            required: true,
            minLength: 2,
        },

        description: {
            type: String,
            required: true,
            minLength: 5,
        },

        status: {
            enum: ["pending", "in-progress", "resolved", "closed"],
            type: String,
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

export const ContactFormSubmission = mongoose.model(
    "ContactFormSubmission",
    contactFormSubmissionSchema
);
export type ContactFormSubmissionType = mongoose.InferSchemaType<
    typeof contactFormSubmissionSchema
>;
