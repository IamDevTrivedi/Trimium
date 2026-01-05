import { config } from "@config/env";
import { ConnectionOptions } from "bullmq";

export const redisConfig: ConnectionOptions = config.LOCAL_REDIS
    ? {
          host: "localhost",
          port: 6379,
      }
    : {
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
          username: config.REDIS_USERNAME,
          password: config.REDIS_PASSWORD,
      };
