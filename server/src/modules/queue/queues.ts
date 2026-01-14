import { Queue } from "bullmq";
import { redisConfig } from "./redisConfig";
import { SendEmailJobData } from "./processors/sendEmail";
import { UpdateLastActivityJobData } from "./processors/updateLastActivity";

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
            delay: 3000,
        },
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
