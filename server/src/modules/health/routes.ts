import { Router } from "express";
import { controller } from "./controllers";
import { createRateLimiter } from "@/middlewares/rateLimiter";
import { ONE_MINUTE_IN_MS } from "@/constants/time";

const router = Router();

const healthLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 120,
    prefix: "rl:health",
});

/**
 * @openapi
 * /api/v1/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     description: Check API and database connectivity. Optionally pass an email in the body to test DB queries.
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 */
router.get("/", healthLimiter, controller.index);

export default router;
