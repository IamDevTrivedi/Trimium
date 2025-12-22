import { Router } from "express";
import { controllers } from "../user/controllers";
import { protectRoute } from "@/middlewares/protectRoute";

const router = Router();

router.post("/change-name", protectRoute, controllers.changeName);
router.post("/change-password", protectRoute, controllers.changePassword);
router.post("/change-username", protectRoute, controllers.changeUsername);

export default router;
