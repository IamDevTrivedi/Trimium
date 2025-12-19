const config = {
    PUBLIC_NODE_ENV: process.env.NODE_ENV,

    PUBLIC_BACKEND_URL_DEV: process.env.NEXT_PUBLIC_BACKEND_URL_DEV,
    PUBLIC_BACKEND_URL_PROD: process.env.NEXT_PUBLIC_BACKEND_URL_PROD,
    PUBLIC_BACKEND_URL:
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_BACKEND_URL_PROD
            : process.env.NEXT_PUBLIC_BACKEND_URL_DEV,

    PUBLIC_FRONTEND_URL_DEV: process.env.NEXT_PUBLIC_FRONTEND_URL_DEV,
    PUBLIC_FRONTEND_URL_PROD: process.env.NEXT_PUBLIC_FRONTEND_URL_PROD,
    PUBLIC_FRONTEND_URL:
        process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_FRONTEND_URL_PROD
            : process.env.NEXT_PUBLIC_FRONTEND_URL_DEV,
} as const;

export default config;
