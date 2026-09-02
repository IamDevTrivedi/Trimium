import pino from "pino";
import { config } from "@config/env";

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
        ],
    })
);