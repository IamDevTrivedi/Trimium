import { ContactFormSubmission } from "@/models/contactFormSubmissions";
import { config } from "@config/env";
import { emailTemplates } from "@utils/emailTemplates";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/sendResponse";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { emailQueue, QueueNames } from "@modules/queue/queues";

export const controller = {
    submitContactForm: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                firstName: z.string().min(2),
                lastName: z.string().min(2),
                email: z.email(),
                subject: z.string().min(2),
                description: z.string().min(5),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid request data",
                    errors: z.treeifyError(result.error),
                });
            }

            const { firstName, lastName, email, subject, description } = result.data;

            const newSubmission = new ContactFormSubmission({
                firstName,
                lastName,
                email,
                subject,
                description,
            });

            await newSubmission.save();

            await emailQueue.add(QueueNames.SEND_EMAIL, {
                from: config.SENDER_EMAIL,
                to: email,
                subject: `Contact Form Submission Received: ${subject}`,
                html: emailTemplates.contactFormSubmissionReceived({
                    firstName,
                    lastName,
                    subject,
                    submissionID: newSubmission._id.toString(),
                }),
            });

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Contact form submitted successfully",
            });
        } catch (error) {
            logger.error("Error submitting contact form:");
            logger.error(error);

            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Internal server error",
            });
        }
    },
};
