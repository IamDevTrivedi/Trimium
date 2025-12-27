import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
const router = Router();

router.post("/is-shortcode-available", controllers.isShortcodeAvailable);
router.post("/create-shortcode", protectRoute, controllers.createShortCode);

export default router;
