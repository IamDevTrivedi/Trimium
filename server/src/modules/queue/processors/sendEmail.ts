import { transporter } from "@config/mailer";
import { logger } from "@utils/logger";
import { Job } from "bullmq";

export interface SendEmailJobData {
    to: string;
    from: string;
    subject: string;
    html: string;
}

export const sendEmail = async (job: Job<SendEmailJobData>) => {
    try {
        await transporter.sendMail(job.data);
        logger.info(`Email sent successfully for job ID: ${job.id}`);
    } catch (error) {
        logger.error("Error sending email:");
        logger.error(error);
        throw error;
    }
};
