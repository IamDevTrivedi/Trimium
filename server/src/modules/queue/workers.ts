import { Worker } from "bullmq";
import { redisConfig } from "./redisConfig";
import { sendEmail } from "./processors/sendEmail";
import { updateLastActivity } from "./processors/updateLastActivity";
import { QueueNames } from "./queues";

export const emailWorker = new Worker(QueueNames.SEND_EMAIL, sendEmail, {
    connection: redisConfig,
    concurrency: 5,
});

export const lastActivityWorker = new Worker(
    QueueNames.UPDATE_LAST_ACTIVITY,
    updateLastActivity,
    {
        connection: redisConfig,
        concurrency: 10,
    }
);
