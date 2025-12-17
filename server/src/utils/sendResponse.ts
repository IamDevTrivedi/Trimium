import { Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

export interface ApiResponse<T = unknown> {
    success: boolean;
    statusCode: number;
    reasonPhrase: string;
    message: string;
    data?: T;
}

export interface SendResponseOptions<T> {
    message: string;
    statusCode?: StatusCodes;
    success?: boolean;
    data?: T;
}

export const sendResponse = <T>(
    res: Response,
    { message, data, statusCode = StatusCodes.OK, success = true }: SendResponseOptions<T>
): Response => {
    const response: ApiResponse<T> = {
        success,
        message,
        statusCode,
        reasonPhrase: getReasonPhrase(statusCode),
        ...(data !== undefined && { data }),
    };

    return res.status(statusCode).json(response);
};
