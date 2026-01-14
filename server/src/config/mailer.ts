import axios from "axios";
import { logger } from "@/utils/logger";
import { config } from "./env";

interface MailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

const brevoClient = axios.create({
    baseURL: "https://api.brevo.com/v3",
    headers: {
        "Content-Type": "application/json",
        "api-key": config.BREVO_API_KEY,
    },
});

export const transporter = {
    sendMail: async ({ from, to, subject, html }: MailOptions) => {
        try {
            const emailData = {
                sender: {
                    email: from,
                },
                to: [
                    {
                        email: to,
                    },
                ],
                subject: subject,
                htmlContent: html,
            };

            await brevoClient.post("/smtp/email", emailData);
        } catch (error) {
            logger.error("Failed to send email");
            logger.error(error);
        }
    },

    verify: async (callback?: (error: unknown, success: boolean) => void): Promise<boolean> => {
        try {
            await brevoClient.get("/account");
            if (callback) callback(null, true);
            return true;
        } catch (error) {
            if (callback) callback(error, false);
            return false;
        }
    },
};

export const verifyEmailTransporter = async (): Promise<void> => {
    const isVerified = await transporter.verify();
    if (isVerified) {
        logger.info("Email transporter is configured correctly.");
    } else {
        logger.error("Email transporter configuration error.");
    }
};
