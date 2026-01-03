const config = {
    PUBLIC_NODE_ENV: process.env.NODE_ENV,
    PUBLIC_isProduction: process.env.NODE_ENV === "production",
    PUBLIC_isDevelopment: process.env.NODE_ENV === "development",
    PUBLIC_isTest: process.env.NODE_ENV === "test",

    PUBLIC_BACKEND_URL_DEV: process.env.NEXT_PUBLIC_BACKEND_URL_DEV as string,
    PUBLIC_BACKEND_URL_PROD: process.env.NEXT_PUBLIC_BACKEND_URL_PROD as string,
    PUBLIC_BACKEND_URL:
        process.env.NODE_ENV === "production"
            ? (process.env.NEXT_PUBLIC_BACKEND_URL_PROD as string)
            : (process.env.NEXT_PUBLIC_BACKEND_URL_DEV as string),

    PUBLIC_FRONTEND_URL_DEV: process.env.NEXT_PUBLIC_FRONTEND_URL_DEV as string,
    PUBLIC_FRONTEND_URL_PROD: process.env.NEXT_PUBLIC_FRONTEND_URL_PROD as string,
    PUBLIC_FRONTEND_URL:
        process.env.NODE_ENV === "production"
            ? (process.env.NEXT_PUBLIC_FRONTEND_URL_PROD as string)
            : (process.env.NEXT_PUBLIC_FRONTEND_URL_DEV as string),
} as const;

export default config;
