import { Router } from "express";
import { controllers } from "./controllers";
import { rootLimiter } from "./rl";

const router = Router();

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
