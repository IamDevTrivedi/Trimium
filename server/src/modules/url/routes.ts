import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";
import { ONE_MINUTE_IN_MS } from "@/constants/time";

const router = Router();

const shortcodeCheckLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 30,
    prefix: "rl:url:check",
});

const shortcodeCreateLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 20,
    prefix: "rl:url:create",
});

const bulkCreateLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 10,
    prefix: "rl:url:bulk-create",
});

const urlGeneralLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 60,
    prefix: "rl:url:general",
});

const redirectLimiter = createRateLimiter({
    windowMs: ONE_MINUTE_IN_MS,
    max: 100,
    prefix: "rl:url:redirect",
});

/**
 * @openapi
 * /api/v1/url/check/{shortCode}:
 *   get:
 *     tags: [URL]
 *     summary: Check shortcode availability
 *     description: Check if a shortcode is available for use.
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 available:
 *                   type: boolean
 */
router.get("/check/:shortCode", shortcodeCheckLimiter, controllers.isShortcodeAvailable);

/**
 * @openapi
 * /api/v1/url:
 *   post:
 *     tags: [URL]
 *     summary: Create shortcode
 *     description: Create a new shortened URL. Optionally configure password protection, transfer limits, and scheduling.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceID, title, originalURL]
 *             properties:
 *               workspaceID:
 *                 type: string
 *               title:
 *                 type: string
 *               originalURL:
 *                 type: string
 *                 format: uri
 *               shortCode:
 *                 type: string
 *                 description: Custom shortcode (auto-generated if omitted)
 *               password:
 *                 type: string
 *               maxTransfers:
 *                 type: integer
 *               schedule:
 *                 type: object
 *                 properties:
 *                   startAt:
 *                     type: string
 *                     format: date-time
 *                   endAt:
 *                     type: string
 *                     format: date-time
 *                   countdownEnabled:
 *                     type: boolean
 *                   messageToDisplay:
 *                     type: string
 *     responses:
 *       200:
 *         description: Shortcode created
 *       401:
 *         description: Unauthorized
 */
router.post("/", protectRoute, shortcodeCreateLimiter, controllers.createShortCode);

/**
 * @openapi
 * /api/v1/url/bulk:
 *   post:
 *     tags: [URL]
 *     summary: Bulk create shortcodes
 *     description: Create multiple shortcodes at once from an array of URLs.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               urls:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     originalURL:
 *                       type: string
 *                     title:
 *                       type: string
 *               workspaceID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shortcodes created
 *       401:
 *         description: Unauthorized
 */
router.post("/bulk", protectRoute, bulkCreateLimiter, controllers.bulkCreateShortCodes);

/**
 * @openapi
 * /api/v1/url/{shortCode}:
 *   get:
 *     tags: [URL]
 *     summary: Get shortcode info
 *     description: Get information about a shortcode including its original URL, settings, and metadata.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shortcode details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shortcode not found
 */
router.get("/:shortCode", protectRoute, urlGeneralLimiter, controllers.getShortCodeInfo);

/**
 * @openapi
 * /api/v1/url/{shortCode}:
 *   patch:
 *     tags: [URL]
 *     summary: Edit shortcode
 *     description: Update an existing shortcode's configuration. Only provided fields will be updated.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               originalURL:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               password:
 *                 type: string
 *               maxTransfers:
 *                 type: integer
 *               schedule:
 *                 type: object
 *               rmTransferLimit:
 *                 type: boolean
 *               rmSchedule:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Shortcode updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Shortcode not found
 */
router.patch("/:shortCode", protectRoute, urlGeneralLimiter, controllers.editShortCode);

/**
 * @openapi
 * /api/v1/url/{shortCode}/analytics:
 *   get:
 *     tags: [URL]
 *     summary: Get shortcode analytics
 *     description: Get analytics data for a shortcode including total clicks, unique visitors, device/browser stats, and location data.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics data
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/:shortCode/analytics",
    protectRoute,
    urlGeneralLimiter,
    controllers.shortCodePerformance
);

/**
 * @openapi
 * /api/v1/url/{shortCode}/analytics/export:
 *   get:
 *     tags: [URL]
 *     summary: Export shortcode analytics
 *     description: Export analytics data for a shortcode as a downloadable file.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics export file
 *       401:
 *         description: Unauthorized
 */
router.get(
    "/:shortCode/analytics/export",
    protectRoute,
    urlGeneralLimiter,
    controllers.exportShortCodeAnalytics
);

/**
 * @openapi
 * /api/v1/url/redirect:
 *   post:
 *     tags: [URL]
 *     summary: Resolve redirect
 *     description: Resolve a shortcode to its original URL. Returns a verdict for client-side handling (redirect, password prompt, expired, etc.).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shortCode]
 *             properties:
 *               shortCode:
 *                 type: string
 *               password:
 *                 type: string
 *                 description: Required if the URL is password protected
 *     responses:
 *       200:
 *         description: Redirect verdict returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 verdict:
 *                   type: string
 *                   enum: [REDIRECT, SHOW_PASSWORD_PROMPT, PASSWORD_INCORRECT, EXPIRED, INACTIVE, MAX_TRANSFER_REACHED, INVALID, SHOW_COUNTER]
 *                 originalURL:
 *                   type: string
 *                 displayContent:
 *                   type: object
 */
router.post("/redirect", redirectLimiter, controllers.redirectToOriginalUrl);

/**
 * @openapi
 * /api/v1/url/{shortCode}/tags:
 *   get:
 *     tags: [URL]
 *     summary: Get shortcode tags
 *     description: Get all tags associated with a shortcode.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tags retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/:shortCode/tags", protectRoute, urlGeneralLimiter, controllers.getShortCodeTags);

/**
 * @openapi
 * /api/v1/url/{shortCode}/tags:
 *   patch:
 *     tags: [URL]
 *     summary: Set shortcode tags
 *     description: Replace all tags on a shortcode with the provided tags.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: shortCode
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tagsToAdd]
 *             properties:
 *               tagsToAdd:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Tags updated
 *       401:
 *         description: Unauthorized
 */
router.patch("/:shortCode/tags", protectRoute, urlGeneralLimiter, controllers.setShortCodeTags);

export default router;
