import sgMail from "@sendgrid/mail";

import { config } from "@/config/env";
import { logger } from "@/utils/logger";

export const transporter = {
    sendMail: async (mailOptions: sgMail.MailDataRequired) => {
        sgMail.setApiKey(config.SENDGRID_API_KEY);
        try {
            await sgMail.send(mailOptions);
        } catch (error) {
            logger.error("Error sending email:");
            logger.error(error);
        }
    },
};

export const verifyEmailTransporter = async (): Promise<void> => {
    try {
        sgMail.setApiKey(config.SENDGRID_API_KEY);
        logger.info("Email transporter verified successfully.");
    } catch (error) {
        logger.error("Error verifying email transporter:");
        logger.error(error);
        process.exit(1);
    }
};
