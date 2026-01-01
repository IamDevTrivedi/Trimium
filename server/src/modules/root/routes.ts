import { Router } from "express";
import { controllers } from "./controllers";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const rootLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 120,
    message: "Too many requests. Please slow down.",
    prefix: "rl:root",
});

router.get("/", rootLimiter, controllers.index);

export default router;
