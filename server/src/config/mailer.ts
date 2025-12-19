import nodemailer from "nodemailer";
import { config } from "@/config/env";
import { logger } from "@/utils/logger";

export const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: config.EMAIL_PORT === 465,
    auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 20000,
});

export const verifyEmailTransporter = async (): Promise<void> => {
    if (await transporter.verify()) {
        logger.info("Email transporter is configured correctly.");
    } else {
        logger.error("Email transporter configuration error.");
    }
};
