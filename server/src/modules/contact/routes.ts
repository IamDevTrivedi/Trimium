import { Router } from "express";
import { controller } from "@modules/contact/controller";

const router = Router();

router.post("/submit", controller.submitContactForm);

export default router;
