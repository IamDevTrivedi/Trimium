import { logger } from "@/utils/logger";
import { redisClient } from "@/db/connectRedis";
import { emailQueue, lastActivityQueue } from "@/modules/queue/queues";
import { emailWorker, lastActivityWorker } from "@/modules/queue/workers";
import mongoose from "mongoose";

let httpServer: ReturnType<typeof import("http").createServer> | null = null;
let isShuttingDown = false;

export const setHttpServer = (server: ReturnType<typeof import("http").createServer>) => {
    httpServer = server;
};

export const gracefulShutdown = async (signal: string): Promise<void> => {
    if (isShuttingDown) {
        logger.warn({ signal }, "Shutdown already in progress, ignoring signal");
        return;
    }

    isShuttingDown = true;
    logger.info({ signal }, "Received signal. Starting graceful shutdown...");

    const shutdownTimeout = setTimeout(() => {
        logger.error("Graceful shutdown timed out. Forcing exit.");
        process.exit(1);
    }, 30000); // 30 second hard timeout

    try {
        // 1. Stop accepting new HTTP requests
        if (httpServer) {
            logger.info("Closing HTTP server...");
            await new Promise<void>((resolve, reject) => {
                httpServer!.close((err) => {
                    if (err) {
                        logger.error({ err }, "Error closing HTTP server");
                        reject(err);
                    } else {
                        logger.info("HTTP server closed");
                        resolve();
                    }
                });
            });
        }

        // 2. Close BullMQ workers (stop processing new jobs)
        logger.info("Closing BullMQ workers...");
        await Promise.all([
            emailWorker.close().catch((err) => logger.error({ err }, "Error closing emailWorker")),
            lastActivityWorker
                .close()
                .catch((err) => logger.error({ err }, "Error closing lastActivityWorker")),
        ]);
        logger.info("BullMQ workers closed");

        // 3. Close BullMQ queues (drain and close connections)
        logger.info("Closing BullMQ queues...");
        await Promise.all([
            emailQueue.close().catch((err) => logger.error({ err }, "Error closing emailQueue")),
            lastActivityQueue
                .close()
                .catch((err) => logger.error({ err }, "Error closing lastActivityQueue")),
        ]);
        logger.info("BullMQ queues closed");

        // 4. Close Redis connection
        logger.info("Closing Redis connection...");
        await redisClient.quit().catch((err) => logger.error({ err }, "Error closing Redis"));
        logger.info("Redis connection closed");

        // 5. Close MongoDB connection
        logger.info("Closing MongoDB connection...");
        await mongoose.connection
            .close()
            .catch((err) => logger.error({ err }, "Error closing MongoDB"));
        logger.info("MongoDB connection closed");

        clearTimeout(shutdownTimeout);
        logger.info("Graceful shutdown completed successfully");
        process.exit(0);
    } catch (error) {
        clearTimeout(shutdownTimeout);
        logger.error({ error }, "Error during graceful shutdown");
        process.exit(1);
    }
};

export const setupGracefulShutdown = (server: ReturnType<typeof import("http").createServer>) => {
    setHttpServer(server);

    const signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT", "SIGUSR2"];

    signals.forEach((signal) => {
        process.on(signal, () => gracefulShutdown(signal));
    });

    // Handle uncaught exceptions and unhandled rejections
    process.on("uncaughtException", (error) => {
        logger.error({ error }, "Uncaught Exception");
        gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
        logger.error({ reason, promise: String(promise) }, "Unhandled Rejection");
        gracefulShutdown("unhandledRejection");
    });
};

export const isShutdownInProgress = (): boolean => isShuttingDown;
