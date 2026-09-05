import { Queue } from "bullmq";
import { redisConfig } from "./redisConfig";
import type { SendEmailJobData } from "./processors/sendEmail";
import type { UpdateLastActivityJobData } from "./processors/updateLastActivity";
import { THREE_SECONDS_IN_MS } from "@/constants/time";

export enum QueueNames {
    SEND_EMAIL = "emailQueue",
    UPDATE_LAST_ACTIVITY = "lastActivityQueue",
}

export const emailQueue = new Queue<SendEmailJobData>(QueueNames.SEND_EMAIL, {
    connection: redisConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: THREE_SECONDS_IN_MS,
        },
        priority: 1,
    },
});

export const lastActivityQueue = new Queue<UpdateLastActivityJobData>(
    QueueNames.UPDATE_LAST_ACTIVITY,
    {
        connection: redisConfig,
        defaultJobOptions: {
            attempts: 1,
            removeOnComplete: true,
            removeOnFail: true,
        },
    }
);
