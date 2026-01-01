import { Router } from "express";
import { controllers } from "@modules/auth/controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";

const router = Router();

const otpLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many OTP requests. Please try again after 15 minutes.",
    prefix: "rl:auth:otp",
});

const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts. Please try again after 15 minutes.",
    prefix: "rl:auth:login",
});

const authGeneralLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: "Too many requests. Please slow down.",
    prefix: "rl:auth:general",
});

const usernameCheckLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: "Too many username check requests. Please slow down.",
    prefix: "rl:auth:username",
});

router.post("/send-otp-for-create-account", otpLimiter, controllers.sendOTPForCreateAccount);
router.post("/verify-otp-for-create-account", otpLimiter, controllers.verifyOTPForCreateAccount);
router.post("/create-account", otpLimiter, controllers.createAccount);

router.post("/reset-password/send-otp", otpLimiter, controllers.sendOTPForResetPassword);
router.post("/reset-password/verify-otp", otpLimiter, controllers.verifyOTPForResetPassword);
router.post(
    "/reset-password/set-new-password",
    otpLimiter,
    controllers.setNewPasswordForResetPassword
);

router.post("/login", loginLimiter, controllers.login);

router.post("/logout-my-device", protectRoute, authGeneralLimiter, controllers.logoutMyDevice);
router.post(
    "/logout-all-other-devices",
    protectRoute,
    authGeneralLimiter,
    controllers.logoutAllOtherDevices
);
router.post(
    "/logout-particular-device",
    protectRoute,
    authGeneralLimiter,
    controllers.logoutParticularDevice
);

router.post("/me", protectRoute, authGeneralLimiter, controllers.me);

router.post("/login-history", protectRoute, authGeneralLimiter, controllers.loginHistory);

router.post("/check-username", usernameCheckLimiter, controllers.checkUsernameAvailability);

export default router;
