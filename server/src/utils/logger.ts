import pino from "pino";
import path from "path";
import { config } from "@config/env";

const logDir = path.join(process.cwd(), "logs");
const isProd = config.isProduction;

export const logger = pino(
    {
        level: isProd ? "info" : "debug",
        timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.transport({
        targets: [
            {
                target: "pino-pretty",
                level: "debug",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                },
            },

            {
                target: "pino/file",
                level: "info",
                options: {
                    destination: path.join(logDir, `app-${config.NODE_ENV}.log`),
                    mkdir: true,
                },
            },

            {
                target: "pino/file",
                level: "error",
                options: {
                    destination: path.join(logDir, `error-${config.NODE_ENV}.log`),
                    mkdir: true,
                },
            },
        ],
    })
);
