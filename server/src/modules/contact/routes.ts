import { Router } from "express";
import { controller } from "@modules/contact/controller";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const contactLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 3,
    message: "Too many contact form submissions. Please try again later.",
    prefix: "rl:contact",
});

router.post("/submit", contactLimiter, controller.submitContactForm);

export default router;
