import { Worker } from "bullmq";
import { redisConfig } from "./redisConfig";
import { sendEmail } from "./processors/sendEmail";

export const emailWorker = new Worker("emailQueue", sendEmail, {
    connection: redisConfig,
    concurrency: 5,
});
