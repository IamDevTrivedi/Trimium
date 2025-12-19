import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import { checkEnv } from "@config/checkEnv";
import { config } from "@config/env";
import { logger } from "@utils/logger";
import { httpLoggerMiddleware } from "@/middlewares/httpLogger";
import { connectMongo } from "@db/connectMongo";
import { connectRedis } from "@db/connectRedis";
import { verifyEmailTransporter } from "@config/mailer";
import { UAParserMiddleware } from "@middlewares/UAParser";
import cookieParser from "cookie-parser";

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
    app.use((req: Request, _res: Response, next: NextFunction) => {
        console.log(
            req.headers["x-real-ip"] ||
                (typeof req.headers["x-forwarded-for"] === "string"
                    ? req.headers["x-forwarded-for"].split(",")[0].trim()
                    : undefined) ||
                req.socket?.remoteAddress
        );

        next();
    });

    const { default: rootRoutes } = await import("@modules/root/routes");
    const { default: healthRoutes } = await import("@modules/health/routes");
    const { default: authRoutes } = await import("@modules/auth/routes");

    app.use("/", rootRoutes);
    app.use("/api/v1/health", healthRoutes);
    app.use("/api/v1/auth", authRoutes);

    app.get("/test-ip", (req, res) => {
        res.json({
            ip: req.ip,
            ips: req.ips,
            headers: {
                "x-forwarded-for": req.headers["x-forwarded-for"],
                "x-real-ip": req.headers["x-real-ip"],
                all: req.headers,
            },
            connection: {
                remoteAddress: req.connection?.remoteAddress,
                socketAddress: req.socket?.remoteAddress,
            },
        });
    });

    app.listen(config.PORT, () => {
        logger.info(`Envrionment: ${config.NODE_ENV}`);
        logger.info(`Server is running on ${config.BACKEND_URL}`);
    });
};

init();
