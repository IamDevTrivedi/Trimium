import { config } from "@config/env";
import { ConnectionOptions } from "bullmq";

export const redisConfig: ConnectionOptions = {
    port: config.REDIS_PORT,
    username: config.REDIS_USERNAME,
    password: config.REDIS_PASSWORD,
    host: config.REDIS_HOST,
};
