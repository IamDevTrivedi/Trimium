import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";

import { checkEnv } from "@config/checkEnv";
import { connectMongo } from "@db/connectMongo";
import { connectRedis } from "@db/connectRedis";
import { verifyEmailTransporter } from "@config/mailer";

import { config } from "@config/env";
import { logger } from "@utils/logger";

import { httpLoggerMiddleware } from "@/middlewares/httpLogger";
import { UAParserMiddleware } from "@middlewares/UAParser";
import { IPMiddleware } from "@middlewares/IP";
import { initializeReader, locationMiddleware } from "@middlewares/location";

import "@modules/queue";
import { setupGracefulShutdown } from "@/utils/shutdown";

const init = async () => {
    checkEnv();
    await connectMongo();
    await connectRedis();
    await verifyEmailTransporter();
    await initializeReader();

    const app = express();
    app.set("trust proxy", 1);

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(
        cors({
            origin: (origin, callback) => {
                if (!origin) {
                    return callback(null, true);
                }

                if (origin === config.FRONTEND_URL) {
                    return callback(null, true);
                }

                callback(new Error("Not allowed by CORS"));
            },
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            credentials: true,
        })
    );
    app.use(cookieParser());

    app.use(httpLoggerMiddleware);
    app.use(UAParserMiddleware);
    app.use(IPMiddleware);
    app.use(locationMiddleware);

    const { globalRateLimiter } = await import("@middlewares/rateLimiter");
    app.use(globalRateLimiter);

    const { default: rootRoutes } = await import("@modules/root/routes");
    const { default: healthRoutes } = await import("@modules/health/routes");
    const { default: authRoutes } = await import("@modules/auth/routes");
    const { default: userRoutes } = await import("@modules/user/routes");
    const { default: urlRoutes } = await import("@modules/url/routes");
    const { default: workspaceRoutes } = await import("@modules/workspace/routes");
    const { default: contactRoutes } = await import("@modules/contact/routes");
    const { default: linkhubRoutes } = await import("@modules/linkhub/routes");

    if (config.isDevelopment) {
        const swaggerUi = await import("swagger-ui-express");
        const swaggerSpec = await import("@config/swagger");
        app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    }

    app.use("/", rootRoutes);
    app.use("/api/v1/health", healthRoutes);
    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/user", userRoutes);
    app.use("/api/v1/url", urlRoutes);
    app.use("/api/v1/workspace", workspaceRoutes);
    app.use("/api/v1/contact", contactRoutes);
    app.use("/api/v1/linkhub", linkhubRoutes);

    const server = createServer(app);
    setupGracefulShutdown(server);

    server.listen(config.PORT, () => {
        logger.info(`Environment: ${config.NODE_ENV}`);
        logger.info(`Server is running on ${config.BACKEND_URL}`);
    });
};

init();
