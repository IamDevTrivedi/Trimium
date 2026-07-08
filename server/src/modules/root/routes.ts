import { Router } from "express";
import { controllers } from "./controllers";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const rootLimiter = createRateLimiter({
    windowMs: 60 * 1000,
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
