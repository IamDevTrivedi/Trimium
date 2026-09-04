import { sendResponse } from "@utils/sendResponse";
import type { Request, Response } from "express";

export const controllers = {
    index: (_req: Request, res: Response) => {
        return sendResponse(res, {
            message: "Welcome to Trimium!",
        });
    },
};
