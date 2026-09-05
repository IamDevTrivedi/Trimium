import { Router } from "express";
import { controllers } from "../user/controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";
import { FIFTEEN_MINUTES_IN_MS, FIVE_MINUTES_IN_MS } from "@/constants/time";

const router = Router();

const profileChangeLimiter = createRateLimiter({
    windowMs: FIVE_MINUTES_IN_MS,
    max: 10,
    prefix: "rl:user:profile",
});

const passwordChangeLimiter = createRateLimiter({
    windowMs: FIFTEEN_MINUTES_IN_MS,
    max: 5,
    prefix: "rl:user:password",
});

/**
 * @openapi
 * /api/v1/user/name:
 *   patch:
 *     tags: [User]
 *     summary: Update name
 *     description: Update the authenticated user's first and last name.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName]
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Name updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/name", protectRoute, profileChangeLimiter, controllers.changeName);

/**
 * @openapi
 * /api/v1/user/password:
 *   patch:
 *     tags: [User]
 *     summary: Update password
 *     description: Change the authenticated user's password. Requires the current password for verification.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The current password
 *               newPassword:
 *                 type: string
 *                 description: The new password (min 8 chars, uppercase, lowercase, digit, special char)
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid current password
 *       401:
 *         description: Unauthorized
 */
router.patch("/password", protectRoute, passwordChangeLimiter, controllers.changePassword);

/**
 * @openapi
 * /api/v1/user/username:
 *   patch:
 *     tags: [User]
 *     summary: Update username
 *     description: Update the authenticated user's username.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newUsername]
 *             properties:
 *               newUsername:
 *                 type: string
 *                 description: New username (alphanumeric, underscores, min 3 chars)
 *     responses:
 *       200:
 *         description: Username updated successfully
 *       401:
 *         description: Unauthorized
 */
router.patch("/username", protectRoute, profileChangeLimiter, controllers.changeUsername);

export default router;
