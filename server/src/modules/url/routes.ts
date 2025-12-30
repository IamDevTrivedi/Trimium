import { Router } from "express";
import { controllers } from "./controllers";
import { protectRoute } from "@/middlewares/protectRoute";
const router = Router();

router.post("/is-shortcode-available", controllers.isShortcodeAvailable);
router.post("/create-shortcode", protectRoute, controllers.createShortCode);
router.post("/get-shortcode-info", protectRoute, controllers.getShortCodeInfo);
router.post("/edit-shortcode", protectRoute, controllers.editShortCode);
router.post("/shortcode-performance", protectRoute, controllers.shortCodePerformance);

router.post("/redirect", controllers.redirectToOriginalUrl);

export default router;
