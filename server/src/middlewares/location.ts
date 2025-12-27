import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { logger } from "@utils/logger";
import { redisClient } from "@db/connectRedis";

declare module "express-serve-static-core" {
    interface Locals {
        location: LocationData;
    }
}

interface ApiResponse {
    status: string;
    continent: string;
    country: string;
    regionName: string;
    city: string;
    lat: number;
    lon: number;
}

export interface LocationData {
    continent: string;
    country: string;
    regionName: string;
    city: string;
    lat: number;
    lon: number;
    displayName: string;
}

const CACHE_PREFIX = "location:";
const CACHE_TTL = 86400;
const DEFAULT_LOCATION: LocationData = {
    continent: "unknown",
    country: "unknown",
    regionName: "unknown",
    city: "unknown",
    lat: 0,
    lon: 0,
    displayName: "unknown",
};

export const locationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { clientIP } = res.locals;
    const cacheKey = `${CACHE_PREFIX}${clientIP}`;

    try {
        const cached = await redisClient.get(cacheKey);

        if (cached) {
            res.locals.location = JSON.parse(cached);
            return next();
        }

        const ENDPOINT = `http://ip-api.com/json/${clientIP}?fields=status,continent,country,regionName,city,lat,lon`;
        const { data } = await axios.get<ApiResponse>(ENDPOINT);

        let locationData: LocationData;

        if (data && data.status === "success") {
            locationData = {
                continent: data.continent,
                country: data.country,
                regionName: data.regionName,
                city: data.city,
                lat: data.lat,
                lon: data.lon,
                displayName: `${data.city}, ${data.regionName}, ${data.country}`,
            };
        } else {
            locationData = DEFAULT_LOCATION;
        }

        res.locals.location = locationData;
        await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(locationData));
        next();
    } catch (error) {
        res.locals.location = DEFAULT_LOCATION;
        logger.error(`Location Middleware Error: ${error}`);
        next();
    }
};
