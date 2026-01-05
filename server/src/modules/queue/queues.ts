import { Queue } from "bullmq";
import { redisConfig } from "./redisConfig";
import { SendEmailJobData } from "./processors/sendEmail";

export const emailQueue = new Queue<SendEmailJobData>("emailQueue", {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 3000,
        },
    },
});
