import { Router } from "express";
import { controller } from "@modules/contact/controller";
import { createRateLimiter } from "@/middlewares/rateLimiter";
import { verifyTurnstileToken } from "@/middlewares/verifyTurnstile";

const router = Router();

const contactLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 3,
    prefix: "rl:contact",
});

/**
 * @openapi
 * /api/v1/contact:
 *   post:
 *     tags: [Contact]
 *     summary: Submit contact form
 *     description: Submit a contact form message. Rate limited to 3 requests per 5 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, subject, description]
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: Sender's first name
 *               lastName:
 *                 type: string
 *                 description: Sender's last name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Sender's email address
 *               subject:
 *                 type: string
 *                 description: Subject of the message
 *               description:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/SuccessResponse"
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/ErrorResponse"
 */
router.post("/", contactLimiter, verifyTurnstileToken, controller.submitContactForm);

export default router;
