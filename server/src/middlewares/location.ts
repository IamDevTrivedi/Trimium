import { NextFunction, Request, Response } from "express";
import maxmind, { CityResponse, Reader } from "maxmind";
import path from "path";
import fs from "fs";
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

const DEFAULT_LOCATION: LocationData = {
    continent: "unknown",
    country: "unknown",
    regionName: "unknown",
    city: "unknown",
    lat: 0,
    lon: 0,
    displayName: "unknown",
};

const MMDB_PATH = path.join(__dirname, "..", "constants", "GeoLite2-City.mmdb");
const CACHE_PREFIX = "location:";
const CACHE_TTL = 86400;

let reader: Reader<CityResponse> | null = null;
let useMMDB = false;

export const initializeReader = async () => {
    if (reader) return reader;

    if (fs.existsSync(MMDB_PATH)) {
        try {
            reader = await maxmind.open<CityResponse>(MMDB_PATH);
            useMMDB = true;
            logger.info("MaxMind GeoIP2 Reader initialized successfully");
        } catch (error) {
            useMMDB = false;
            logger.error(`Failed to initialize MaxMind Reader: ${error}`);
            logger.info("Falling back to API-based geolocation");
        }
    } else {
        useMMDB = false;
        logger.warn(`MMDB file not found at ${MMDB_PATH}. Using API-based geolocation`);
    }

    return reader;
};

const getLocationFromMMDB = (ip: string): LocationData | null => {
    if (!reader) return null;
    try {
        const response = reader.get(ip);

        if (response) {
            const continent = response.continent?.names?.en || "unknown";
            const country = response.country?.names?.en || "unknown";
            const regionName = response.subdivisions?.[0]?.names?.en || "unknown";
            const city = response.city?.names?.en || "unknown";
            const lat = response.location?.latitude || 0;
            const lon = response.location?.longitude || 0;

            return {
                continent,
                country,
                regionName,
                city,
                lat,
                lon,
                displayName:
                    [city, regionName, country]
                        .filter(
                            (val) => typeof val === "string" && val !== "unknown" && val.length > 0
                        )
                        .join(", ") || "unknown",
            };
        }
    } catch (error) {
        logger.error(`MaxMind lookup error for IP ${ip}: ${error}`);
    }

    return null;
};

const getLocationFromAPI = async (ip: string): Promise<LocationData> => {
    const cacheKey = `${CACHE_PREFIX}${ip}`;

    try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const ENDPOINT = `http://ip-api.com/json/${ip}?fields=status,continent,country,regionName,city,lat,lon`;
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
                displayName:
                    [data.city, data.regionName, data.country]
                        .filter((val) => typeof val === "string" && val.length > 0)
                        .join(", ") || "unknown",
            };
        } else {
            locationData = DEFAULT_LOCATION;
        }

        await redisClient.set(cacheKey, JSON.stringify(locationData), {
            expiration: {
                type: "EX",
                value: CACHE_TTL,
            },
        });

        return locationData;
    } catch (error) {
        logger.error(`API geolocation error for IP ${ip}: ${error}`);
        return DEFAULT_LOCATION;
    }
};

export const locationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const { clientIP } = res.locals;
    try {
        let locationData: LocationData;

        if (useMMDB && reader) {
            locationData = getLocationFromMMDB(clientIP) || DEFAULT_LOCATION;
        } else {
            locationData = await getLocationFromAPI(clientIP);
        }

        res.locals.location = locationData;
        next();
    } catch (error) {
        res.locals.location = DEFAULT_LOCATION;
        logger.error(`Location Middleware Error: ${error}`);
        next();
    }
};
