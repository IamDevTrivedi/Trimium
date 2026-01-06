import { Queue } from "bullmq";
import { redisConfig } from "./redisConfig";
import { SendEmailJobData } from "./processors/sendEmail";

export enum QueueNames {
    SEND_EMAIL = "emailQueue",
}

export const emailQueue = new Queue<SendEmailJobData>(QueueNames.SEND_EMAIL, {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 3000,
        },
    },
});
