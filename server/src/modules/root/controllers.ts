import { sendResponse } from "@utils/sendResponse";
import { Request, Response } from "express";

export const controllers = {
    index: (req: Request, res: Response) => {
        return sendResponse(res, {
            message: "Welcome to the Trimium API!",
        });
    },
};
