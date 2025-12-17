import mongoose from "mongoose";
import { config } from "@/config/env";
import { logger } from "@/utils/logger";

let isConnected = false;

export const connectMongo = async (): Promise<typeof mongoose> => {
    if (isConnected) {
        return mongoose;
    }
    try {
        const conn = await mongoose.connect(config.MONGODB_URI);
        isConnected = true;
        logger.info(`MongoDB connected: ${conn.connection.name} at ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};
