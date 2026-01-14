import { LoginHistory } from "@/models/loginHistory";
import { logger } from "@utils/logger";
import { Job } from "bullmq";

export interface UpdateLastActivityJobData {
    loginHistoryID: string;
    timestamp: number;
}

export const updateLastActivity = async (job: Job<UpdateLastActivityJobData>) => {
    try {
        const { loginHistoryID, timestamp } = job.data;

        await LoginHistory.updateOne(
            { _id: loginHistoryID },
            { $set: { lastAccessedAt: timestamp } }
        );

        logger.info(`Last activity updated for loginHistoryID: ${loginHistoryID}`);
    } catch (error) {
        logger.error("Error updating last activity:");
        logger.error(error);
    }
};
