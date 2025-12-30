import { NextFunction, Request, Response } from "express";
import { UAParser } from "ua-parser-js";

declare module "express-serve-static-core" {
    interface Locals {
        ua: UAParser.IResult;
    }
}

export const getDeviceType = (
    headers: Record<string, string | string[] | undefined>
): "desktop" | "mobile" | "tablet" | undefined => {
    let userAgent = headers["user-agent"] || headers["User-Agent"] || "";

    if (Array.isArray(userAgent)) {
        userAgent = userAgent[0] || "";
    }

    userAgent = userAgent.toLowerCase();

    if (!userAgent) {
        return undefined;
    }

    const tabletPattern = /ipad|android(?!.*mobile)|tablet|kindle|silk|playbook/i;
    if (tabletPattern.test(userAgent)) {
        return "tablet";
    }

    const mobilePattern =
        /mobile|iphone|ipod|android.*mobile|blackberry|opera mini|windows phone|webos/i;
    if (mobilePattern.test(userAgent)) {
        return "mobile";
    }

    const desktopPattern = /windows|macintosh|linux|x11/i;
    if (desktopPattern.test(userAgent)) {
        return "desktop";
    }

    return undefined;
};

export const UAParserMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const parser = new UAParser(req.headers["user-agent"]);
    res.locals.ua = parser.getResult();
    res.locals.ua.device.type = getDeviceType(req.headers);
    next();
};
