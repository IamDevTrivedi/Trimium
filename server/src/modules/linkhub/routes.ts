import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";
import { uploadAvatar } from "@/middlewares/upload";

const router = Router();

const linkhubUpdateLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 30,
    prefix: "rl:linkhub:update",
});

const linkhubPublicLimiter = createRateLimiter({
    windowMs: 1 * 60 * 1000,
    max: 60,
    prefix: "rl:linkhub:public",
});

/**
 * @openapi
 * /api/v1/linkhub/me:
 *   get:
 *     tags: [Linkhub]
 *     summary: Get my profile
 *     description: Get the authenticated user's linkhub profile page configuration.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protectRoute, controllers.getMyLinkhub);

/**
 * @openapi
 * /api/v1/linkhub/me:
 *   put:
 *     tags: [Linkhub]
 *     summary: Update my profile
 *     description: Update the authenticated user's linkhub profile page configuration. Full replacement of profile data.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Linkhub profile configuration (bio, social links, appearance, etc.)
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
router.put("/me", protectRoute, linkhubUpdateLimiter, controllers.updateMyLinkhub);

/**
 * @openapi
 * /api/v1/linkhub/me/avatar:
 *   post:
 *     tags: [Linkhub]
 *     summary: Upload avatar
 *     description: Upload or update the authenticated user's linkhub avatar image.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/me/avatar",
    protectRoute,
    linkhubUpdateLimiter,
    uploadAvatar,
    controllers.uploadAvatar
);

/**
 * @openapi
 * /api/v1/linkhub/u/{username}:
 *   get:
 *     tags: [Linkhub]
 *     summary: Get public profile
 *     description: Get a user's public linkhub profile by username. No authentication required.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Public profile retrieved
 *       404:
 *         description: User not found
 */
router.get("/u/:username", linkhubPublicLimiter, controllers.getPublicLinkhub);

export default router;
