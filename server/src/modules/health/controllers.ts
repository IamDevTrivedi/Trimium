import { Request, Response } from "express";
import { config } from "@config/env";
import { sendResponse } from "@utils/sendResponse";

export const controller = {
    index: (req: Request, res: Response) => {
        const memoryUsage = process.memoryUsage();

        return sendResponse(res, {
            message: "Server is healthy",
            data: {
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: config.NODE_ENV,
                server: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    arch: process.arch,
                },
                memory: {
                    rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
                    heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                    heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                    external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
                },
            },
        });
    },
};
