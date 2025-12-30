import { NextFunction, Request, Response } from "express";
import { UAParser } from "ua-parser-js";

export interface ParsedUA {
    ua: string;

    browser: {
        name: string;
        version: string;
        major: string;
        type: string;
    };

    cpu: {
        architecture: string;
    };

    device: {
        type: string;
        model: string;
        vendor: string;
    };

    engine: {
        name: string;
        version: string;
    };

    os: {
        name: string;
        version: string;
    };
}

declare module "express-serve-static-core" {
    interface Locals {
        ua: ParsedUA;
    }
}

// ? Function to determine device type from User-Agent string: UA parser Library is bugging here
export const getDeviceType = (
    headers: Record<string, string | string[] | undefined>
): "desktop" | "mobile" | "tablet" | "unknown" => {
    let userAgent = headers["user-agent"] || headers["User-Agent"] || "";

    if (Array.isArray(userAgent)) {
        userAgent = userAgent[0] || "";
    }

    userAgent = userAgent.toLowerCase();

    if (!userAgent) {
        return "unknown";
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

    return "unknown";
};

export const UAParserMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const parser = new UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    res.locals.ua = {
        ua: result.ua || "unknown",

        browser: {
            name: result.browser.name || "unknown",
            version: result.browser.version || "unknown",
            major: result.browser.major || "unknown",
            type: result.browser.type || "unknown",
        },

        cpu: {
            architecture: result.cpu.architecture || "unknown",
        },

        device: {
            type: result.device.type || getDeviceType(req.headers),
            model: result.device.model || "unknown",
            vendor: result.device.vendor || "unknown",
        },

        engine: {
            name: result.engine.name || "unknown",
            version: result.engine.version || "unknown",
        },

        os: {
            name: result.os.name || "unknown",
            version: result.os.version || "unknown",
        },
    };
    next();
};
