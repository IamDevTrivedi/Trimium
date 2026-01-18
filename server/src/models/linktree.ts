import mongoose from "mongoose";

export const LINKTREE_THEMES = ["midnight", "sunset", "forest", "ocean", "lavender"] as const;

export type LinktreeTheme = (typeof LINKTREE_THEMES)[number];

export interface ILinktreeLink {
    id: string;
    title: string;
    url: string;
    isActive: boolean;
}

export interface ILinktreeSocials {
    instagram?: string;
    linkedin?: string;
    github?: string;
    x?: string;
    youtube?: string;
    tiktok?: string;
    portfolio?: string;
    email?: string;
}

export interface ILinktree {
    _id: mongoose.Types.ObjectId;
    userID: mongoose.Types.ObjectId;
    title: string;
    bio: string;
    avatarUrl?: string;
    links: ILinktreeLink[];
    socials: ILinktreeSocials;
    theme: LinktreeTheme;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const linktreeLinkSchema = new mongoose.Schema(
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

const linktreeSocialsSchema = new mongoose.Schema(
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

const linktreeSchema = new mongoose.Schema(
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
            type: [linktreeLinkSchema],
            default: [],
            validate: {
                validator: (v: ILinktreeLink[]) => v.length <= 20,
                message: "Maximum 20 links allowed",
            },
        },
        socials: {
            type: linktreeSocialsSchema,
            default: {},
        },
        theme: {
            type: String,
            enum: LINKTREE_THEMES,
            default: "midnight",
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

linktreeSchema.index({ userID: 1 }, { unique: true });

export const Linktree = mongoose.model<ILinktree>("Linktree", linktreeSchema);
