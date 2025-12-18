import express from "express";
import cors from "cors";

import { checkEnv } from "@config/checkEnv";
import { config } from "@config/env";
import { logger } from "@utils/logger";
import { httpLogger } from "@/middlewares/httpLogger";
import { connectMongo } from "@db/connectMongo";
import { connectRedis } from "@db/connectRedis";
import { verifyEmailTransporter } from "@config/mailer";

const init = async () => {
    // PRE CONDITIONS
    checkEnv();
    await connectMongo();
    await connectRedis();
    await verifyEmailTransporter();

    // INITIALIZE EXPRESS APP & CORE MIDDLEWARES
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(
        cors({
            origin: config.FRONTEND_URL,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            credentials: true,
        })
    );

    // CUSTOM MIDDLEWARES
    app.use(httpLogger);

    // IMPORT ROUTES
    const { default: rootRoutes } = await import("@modules/root/routes");
    const { default: healthRoutes } = await import("@modules/health/routes");

    // ROUTES
    app.use("/", rootRoutes);
    app.use("/health", healthRoutes);

    // START SERVER
    app.listen(config.PORT, () => {
        logger.info(`Envrionment: ${config.NODE_ENV}`);
        logger.info(`Server is running on ${config.BACKEND_URL}`);
    });
};

init();
