import { sendResponse } from "@utils/sendResponse";
import { Request, Response } from "express";

export const controller = {
    index: (req: Request, res: Response) => {
        return sendResponse(res, {
            message: "Welcome to the Redirect API!",
        });
    },
};
