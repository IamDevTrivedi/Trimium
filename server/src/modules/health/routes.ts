import { Router } from "express";
import { controller } from "./controllers";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const healthLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 120,
    message: "Too many health check requests. Please slow down.",
    prefix: "rl:health",
});

router.get("/", healthLimiter, controller.index);

export default router;
