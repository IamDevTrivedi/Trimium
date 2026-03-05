import { config } from "@/config/env";
import { logger } from "@/utils/logger";
import { createClient } from "redis";

const client = createClient({
    username: config.REDIS_USERNAME,
    password: config.REDIS_PASSWORD,
    socket: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
    },
});

client.on("error", (error: Error) => {
    logger.error("Redis Client Error");
    logger.error(error);
    process.exit(1);
});

client.on("connect", () => {
    logger.info(`Redis Client Connected: ${config.REDIS_HOST}`);
});

const connectRedis = async (): Promise<void> => {
    try {
        await client.connect();
    } catch (error) {
        logger.error("Redis Client Connection Failed");
        logger.error(error);
        process.exit(1);
    }
};

export { connectRedis, client as redisClient };
