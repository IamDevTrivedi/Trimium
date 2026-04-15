import pinoHttp from "pino-http";
import { logger } from "@utils/logger";

const getRequestUrl = (req: { originalUrl?: string; url?: string }) =>
    req.originalUrl ?? req.url ?? "/";

export const httpLoggerMiddleware = pinoHttp({
    logger,

    serializers: {
        req: () => undefined,
        res: () => undefined,
        err: () => undefined,
    },

    customAttributeKeys: {
        req: "",
        res: "",
        err: "",
        responseTime: "",
    },

    customLogLevel: (req, res, err) => {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },

    customSuccessMessage: (req, res) => `${req.method} ${getRequestUrl(req)} ${res.statusCode}`,

    customErrorMessage: (req, res, err) =>
        `${req.method} ${getRequestUrl(req)} ${res.statusCode} - ${err.message}`,
});
