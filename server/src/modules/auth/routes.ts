import { Router } from "express";
import { controllers } from "@modules/auth/controllers";
import { protectRoute } from "@/middlewares/protectRoute";

const router = Router();

router.post("/send-otp-for-create-account", controllers.sendOTPForCreateAccount);
router.post("/verify-otp-for-create-account", controllers.verifyOTPForCreateAccount);
router.post("/create-account", controllers.createAccount);

router.post("/reset-password/send-otp", controllers.sendOTPForResetPassword);
router.post("/reset-password/verify-otp", controllers.verifyOTPForResetPassword);
router.post("/reset-password/set-new-password", controllers.setNewPasswordForResetPassword);

router.post("/login", controllers.login);

router.post("/logout-my-device", protectRoute, controllers.logoutMyDevice);
router.post("/logout-all-other-devices", protectRoute, controllers.logoutAllOtherDevices);
router.post("/logout-particular-device", protectRoute, controllers.logoutParticularDevice);

router.post("/me", protectRoute, controllers.me);

router.post("/login-history", protectRoute, controllers.loginHistory);

export default router;
