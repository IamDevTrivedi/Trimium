import { NextFunction, Request, Response } from "express";
import { UAParser } from "ua-parser-js";

declare module "express-serve-static-core" {
    interface Locals {
        ua: UAParser.IResult;
    }
}

export const UAParserMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const parser = new UAParser(req.headers["user-agent"]);
    res.locals.ua = parser.getResult();
    next();
};
