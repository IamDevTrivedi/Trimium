import { Router } from "express";
import { controllers } from "./controllers";
import { createRateLimiter } from "@/middlewares/rateLimiter";
import { ONE_MINUTE_IN_MS } from "@/constants/time";

const router = Router();

const rootLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 120,
    prefix: "rl:root",
});

/**
 * @openapi
 * /:
 *   get:
 *     tags: [Root]
 *     summary: Server root endpoint
 *     description: Returns a simple response to confirm the server is running.
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 */
router.get("/", rootLimiter, controllers.index);

export default router;
