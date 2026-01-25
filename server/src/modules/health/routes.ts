import { Router } from "express";
import { controller } from "./controllers";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const healthLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 120,
    prefix: "rl:health",
});

router.get("/", healthLimiter, controller.index);

export default router;
