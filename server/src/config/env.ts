const NODE_ENV = process.env.NODE_ENV as "development" | "production";

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

    SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_PORT: Number(process.env.SMTP_PORT),
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASS: process.env.SMTP_PASS as string,
    SENDER_EMAIL: process.env.SENDER_EMAIL as string,

    JWT_KEY: process.env.JWT_KEY as string,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY as string,

    PoW_SECRET: process.env.PoW_SECRET as string,
    PoW_DIFFICULTY: Number(process.env.PoW_DIFFICULTY),

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,

    EMAIL_LOGOUT_SIGNING_KEY: process.env.EMAIL_LOGOUT_SIGNING_KEY as string,
} as const;
