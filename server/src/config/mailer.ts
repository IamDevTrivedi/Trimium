import nodemailer from "nodemailer";
import { logger } from "@/utils/logger";
import { config } from "./env";

export const transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
    },
});

export const verifyEmailTransporter = async (): Promise<void> => {
    const isVerified = await transporter.verify();

    if (isVerified) {
        logger.info("Email transporter is configured correctly.");
    } else {
        logger.error("Email transporter configuration error.");
    }
};
