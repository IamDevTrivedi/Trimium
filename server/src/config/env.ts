import dotenv from "dotenv";
import path from "path";
import fs from "fs";

const NODE_ENV = process.env.NODE_ENV as "development" | "production";
const devEnv = path.resolve(__dirname, "../../.env.development");
const prodEnv = path.resolve(__dirname, "../../.env.production");

if (NODE_ENV === "development") {
    if (fs.existsSync(devEnv)) {
        dotenv.config({ path: devEnv });
    } else {
        console.error(".env.development file not found");
        process.exit(1);
    }
} else if (NODE_ENV === "production") {
    if (fs.existsSync(prodEnv)) {
        dotenv.config({ path: prodEnv });
    } else {
        console.warn(".env.production file not found");
        dotenv.config();
    }
}

export const config = {
    NODE_ENV,
    isProduction: NODE_ENV === "production",
    isDevelopment: NODE_ENV === "development",

    PORT: Number(process.env.PORT),

    BACKEND_URL_PROD: process.env.BACKEND_URL_PROD as string,
    BACKEND_URL_DEV: process.env.BACKEND_URL_DEV as string,
    FRONTEND_URL_PROD: process.env.FRONTEND_URL_PROD as string,
    FRONTEND_URL_DEV: process.env.FRONTEND_URL_DEV as string,

    BACKEND_URL:
        NODE_ENV === "production"
            ? (process.env.BACKEND_URL_PROD as string)
            : (process.env.BACKEND_URL_DEV as string),

    FRONTEND_URL:
        NODE_ENV === "production"
            ? (process.env.FRONTEND_URL_PROD as string)
            : (process.env.FRONTEND_URL_DEV as string),

    MONGODB_URI: process.env.MONGODB_URI as string,

    REDIS_USERNAME: process.env.REDIS_USERNAME as string,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD as string,
    REDIS_HOST: process.env.REDIS_HOST as string,
    REDIS_PORT: Number(process.env.REDIS_PORT),
    LOCAL_REDIS: Number(process.env.LOCAL_REDIS),

    EMAIL_HOST: process.env.EMAIL_HOST as string,
    EMAIL_PORT: Number(process.env.EMAIL_PORT),
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
    SENDER_EMAIL: process.env.SENDER_EMAIL as string,
    BREVO_API_KEY: process.env.BREVO_API_KEY as string,

    JWT_KEY: process.env.JWT_KEY as string,

    PoW_SECRET: process.env.PoW_SECRET as string,
    PoW_DIFFICULTY: Number(process.env.PoW_DIFFICULTY),

    ADMIN_EMAILS: (process.env.ADMIN_EMAILS as string).split("|").filter(Boolean),

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
} as const;
