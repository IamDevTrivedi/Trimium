import { Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

export interface ApiResponse {
    success: boolean;
    statusCode: number;
    reasonPhrase: string;
    message: string;
    [key: string]: unknown;
}

export interface SendResponseOptions {
    message: string;
    statusCode?: StatusCodes;
    success?: boolean;
    [key: string]: unknown;
}

export const sendResponse = (
    res: Response,
    { message, statusCode = StatusCodes.OK, success = true, ...other }: SendResponseOptions
): Response => {
    const response: ApiResponse = {
        success,
        message,
        statusCode,
        reasonPhrase: getReasonPhrase(statusCode),
        ...other,
    };

    return res.status(statusCode).json(response);
};
