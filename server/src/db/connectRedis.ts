import { config } from "@/config/env";
import { logger } from "@/utils/logger";
import { createClient, RedisClientType } from "redis";

let client: RedisClientType;

if (config.LOCAL_REDIS) {
    client = createClient();
} else {
    client = createClient({
        username: config.REDIS_USERNAME,
        password: config.REDIS_PASSWORD,
        socket: {
            host: config.REDIS_HOST,
            port: config.REDIS_PORT,
        },
    });
}

client.on("error", (error: Error) => {
    logger.error("Redis Client Error");
    logger.error(error);
    process.exit(1);
});

client.on("connect", () => {
    logger.info(`Redis Client Connected: ${config.LOCAL_REDIS ? "Local" : "Remote"} Instance`);
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
