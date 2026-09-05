import pinoHttp from "pino-http";
import { randomUUID } from "crypto";
import { logger } from "@utils/logger";

export const httpLoggerMiddleware = pinoHttp({
    logger,

    genReqId: (req, res) => {
        const existing = req.headers["x-request-id"];
        const id = (Array.isArray(existing) ? existing[0] : existing) ?? randomUUID();
        res.setHeader("x-request-id", id);
        return id;
    },

    redact: {
        paths: ["req.headers.authorization", "req.headers.cookie", "res.headers['set-cookie']"],
        censor: "[REDACTED]",
    },
});
