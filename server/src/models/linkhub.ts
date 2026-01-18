import mongoose from "mongoose";

export const LINKHUB_THEMES = ["midnight", "sunset", "forest", "ocean", "lavender"] as const;

export type LinkhubTheme = (typeof LINKHUB_THEMES)[number];

export interface ILinkhubLink {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
}

export interface ILinkhubSocials {
    instagram?: string;
    linkedin?: string;
    github?: string;
    x?: string;
    youtube?: string;
    tiktok?: string;
    portfolio?: string;
    email?: string;
}

export interface ILinkhub {
    _id: mongoose.Types.ObjectId;
    userID: mongoose.Types.ObjectId;
    title: string;
    bio: string;
    avatarUrl?: string;
    links: ILinkhubLink[];
    socials: ILinkhubSocials;
    theme: LinkhubTheme;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const linkhubLinkSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 100,
            trim: true,
        },
        url: {
            type: String,
            required: true,
            maxlength: 2048,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

const linkhubSocialsSchema = new mongoose.Schema(
    {
        instagram: { type: String, maxlength: 100, trim: true },
        linkedin: { type: String, maxlength: 100, trim: true },
        github: { type: String, maxlength: 100, trim: true },
        x: { type: String, maxlength: 100, trim: true },
        youtube: { type: String, maxlength: 100, trim: true },
        tiktok: { type: String, maxlength: 100, trim: true },
        portfolio: { type: String, maxlength: 2048, trim: true },
        email: { type: String, maxlength: 320, trim: true },
    },
    { _id: false }
);

const linkhubSchema = new mongoose.Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        title: {
            type: String,
            maxlength: 100,
            trim: true,
            default: "",
        },
        bio: {
            type: String,
            maxlength: 500,
            trim: true,
            default: "",
        },
        avatarUrl: {
            type: String,
            maxlength: 2048,
            trim: true,
        },
        links: {
            type: [linkhubLinkSchema],
            default: [],
            validate: {
                validator: (v: ILinkhubLink[]) => v.length <= 20,
                message: "Maximum 20 links allowed",
            },
        },
        socials: {
            type: linkhubSocialsSchema,
            default: {},
        },
        theme: {
            type: String,
            enum: LINKHUB_THEMES,
            default: "midnight",
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const Linkhub = mongoose.model<ILinkhub>("Linkhub", linkhubSchema);
