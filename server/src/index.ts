import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { checkEnv } from "@config/checkEnv";
import { connectMongo } from "@db/connectMongo";
import { connectRedis } from "@db/connectRedis";
import { verifyEmailTransporter } from "@config/mailer";

import { config } from "@config/env";
import { logger } from "@utils/logger";

import { httpLoggerMiddleware } from "@/middlewares/httpLogger";
import { UAParserMiddleware } from "@middlewares/UAParser";
import { IPMiddleware } from "@middlewares/IP";
import { locationMiddleware } from "./middlewares/location";

const init = async () => {
    checkEnv();
    await connectMongo();
    await connectRedis();
    await verifyEmailTransporter();

    const app = express();
    app.set("trust proxy", true);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(
        cors({
            origin: config.FRONTEND_URL,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            credentials: true,
        })
    );
    app.use(cookieParser());

    app.use(httpLoggerMiddleware);
    app.use(UAParserMiddleware);
    app.use(IPMiddleware);
    app.use(locationMiddleware);

    const { default: rootRoutes } = await import("@modules/root/routes");
    const { default: healthRoutes } = await import("@modules/health/routes");
    const { default: authRoutes } = await import("@modules/auth/routes");
    const { default: userRoutes } = await import("@modules/user/routes");
    const { default: urlRoutes } = await import("@modules/url/routes");
    const { default: workspaceRoutes } = await import("@/modules/workspace/routes");

    app.use("/", rootRoutes);
    app.use("/api/v1/health", healthRoutes);
    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1/user", userRoutes);
    app.use("/api/v1/url", urlRoutes);
    app.use("/api/v1/workspace", workspaceRoutes);

    app.listen(config.PORT, () => {
        logger.info(`Envrionment: ${config.NODE_ENV}`);
        logger.info(`Server is running on ${config.BACKEND_URL}`);
    });
};

init();
