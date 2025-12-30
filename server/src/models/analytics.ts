import mongoose from "mongoose";

const deviceStatsSchema = new mongoose.Schema(
    {
        desktop: { type: Number, default: 0 },
        mobile: { type: Number, default: 0 },
        tablet: { type: Number, default: 0 },
        others: { type: Number, default: 0 },
    },
    {
        _id: false,
        versionKey: false,
        timestamps: false,
    }
);

const browserStatsSchema = new mongoose.Schema(
    {
        chrome: { type: Number, default: 0 },
        firefox: { type: Number, default: 0 },
        safari: { type: Number, default: 0 },
        edge: { type: Number, default: 0 },
        opera: { type: Number, default: 0 },
        others: { type: Number, default: 0 },
    },
    {
        _id: false,
        versionKey: false,
        timestamps: false,
    }
);

const dailyStatsSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true,
            set: (d: Date) => new Date(d.toISOString().split("T")[0]),
        },

        totalClicks: {
            type: Number,
            default: 0,
        },

        uniqueVisitors: {
            type: [String],
            default: () => [],
        },
    },
    {
        _id: false,
        versionKey: false,
        timestamps: false,
    }
);

const analyticsSchema = new mongoose.Schema(
    {
        shortCode: {
            type: String,
            required: true,
            unique: true,
            ref: "URL",
        },

        workspaceID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },

        totalClicks: {
            type: Number,
            default: 0,
        },

        lands: {
            type: Number,
            default: 0,
        },

        uniqueVisitors: {
            type: [String],
            default: () => [],
        },

        deviceStats: {
            type: deviceStatsSchema,
            default: () => ({}),
        },

        browserStats: {
            type: browserStatsSchema,
            default: () => ({}),
        },

        dailyStats: {
            type: [dailyStatsSchema],
            default: [],
        },

        hourlyStats: {
            type: [Number],
            default: () => new Array(24).fill(0),
            validate: {
                validator: (v: number[]) => v.length === 24,
                message: "hourlyDistribution must have exactly 24 elements",
            },
        },

        weeklyStats: {
            type: [Number],
            default: () => new Array(7).fill(0),
            validate: {
                validator: (v: number[]) => v.length === 7,
                message: "weeklyDistribution must have exactly 7 elements",
            },
        },

        locationStats: {
            type: Map,
            of: Number,
            default: new Map<string, number>(),
        },
    },
    {
        timestamps: true,
    }
);

export const Analytics = mongoose.model("Analytics", analyticsSchema);
export type IAnalytics = mongoose.Document & mongoose.InferSchemaType<typeof analyticsSchema>;
