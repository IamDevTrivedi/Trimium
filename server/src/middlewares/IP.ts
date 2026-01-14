import { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
    interface Locals {
        clientIP: string;
    }
}

const isPrivateIP = (ip: string): boolean => {
    if (!ip) {
        return false;
    }

    return (
        ip.startsWith("10.") ||
        ip.startsWith("192.168.") ||
        (ip.startsWith("172.") &&
            (() => {
                const second = Number(ip.split(".")[1]);
                return second >= 16 && second <= 31;
            })()) ||
        ip === "::1" ||
        ip === "127.0.0.1" ||
        ip.startsWith("fc") ||
        ip.startsWith("fd")
    );
};

export const getClientIP = (req: Request): string => {
    const xForwardedFor = req.headers["x-forwarded-for"];
    if (xForwardedFor) {
        const ips = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor.split(",")[0];
        return ips.trim();
    }

    const xRealIP = req.headers["x-real-ip"];
    if (xRealIP) {
        return Array.isArray(xRealIP) ? xRealIP[0] : xRealIP;
    }

    return req.ip || "";
};

export const IPMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let clientIP = getClientIP(req);

        if (clientIP.startsWith("::ffff:")) {
            clientIP = clientIP.substring(7);
        }

        if (isPrivateIP(clientIP) || !clientIP) {
            clientIP = "8.8.8.8";
        }

        res.locals.clientIP = clientIP;
        next();
    } catch (err) {
        console.error("IPMiddleware error:", err);
        next(err);
    }
};
