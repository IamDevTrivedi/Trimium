import { Worker } from "bullmq";
import { redisConfig } from "./redisConfig";
import { sendEmail } from "./processors/sendEmail";
import { QueueNames } from "./queues";

export const emailWorker = new Worker(QueueNames.SEND_EMAIL, sendEmail, {
    connection: redisConfig,
    concurrency: 5,
});
