import { z } from "zod";
import { config } from "@config/env";
import { logger } from "@utils/logger";

export const envSchema = z
    .object({
        NODE_ENV: z.enum(["development", "production"]),
        isProduction: z.boolean(),
        isDevelopment: z.boolean(),

        PORT: z.int().min(1000).max(9999),

        BACKEND_URL_DEV: z.url(),
        BACKEND_URL_PROD: z.url(),

        FRONTEND_URL_DEV: z.url(),
        FRONTEND_URL_PROD: z.url(),

        BACKEND_URL: z.url(),
        FRONTEND_URL: z.url(),

        MONGODB_URI: z.url(),

        REDIS_USERNAME: z.string().min(1),
        REDIS_PASSWORD: z.string().min(1),
        REDIS_HOST: z.string().min(1),
        REDIS_PORT: z.number().min(1).max(65535),
        LOCAL_REDIS: z.union([z.literal(0), z.literal(1)]),
    })
    .strict();

export const checkEnv = () => {
    const result = envSchema.safeParse(config);

    if (!result.success) {
        console.log("Invalid environment configuration:");
        console.error(z.treeifyError(result.error));
        process.exit(1);
    }

    logger.info("Environment configuration is valid.");
};

export type Config = z.infer<typeof envSchema>;
