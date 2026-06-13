import { Router } from "express";
import { controllers } from "@modules/auth/controllers";
import { protectRoute } from "@/middlewares/protectRoute";
import { createRateLimiter } from "@/middlewares/rateLimiter";
import { verifyTurnstileToken } from "@/middlewares/verifyTurnstile";

const router = Router();

const otpLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    prefix: "rl:auth:otp",
});

const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    prefix: "rl:auth:login",
});

const authGeneralLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    prefix: "rl:auth:general",
});

const usernameCheckLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    prefix: "rl:auth:username",
});

router.post("/otp", otpLimiter, verifyTurnstileToken, controllers.sendOTPForCreateAccount);
router.post("/otp/verify", otpLimiter, controllers.verifyOTPForCreateAccount);
router.post("/accounts", otpLimiter, controllers.createAccount);

router.post(
    "/otp/reset-password",
    otpLimiter,
    verifyTurnstileToken,
    controllers.sendOTPForResetPassword
);
router.post("/otp/reset-password/verify", otpLimiter, controllers.verifyOTPForResetPassword);
router.patch("/accounts/password", otpLimiter, controllers.setNewPasswordForResetPassword);

router.post("/login", loginLimiter, verifyTurnstileToken, controllers.login);

router.post("/logout", protectRoute, authGeneralLimiter, controllers.logoutMyDevice);
router.post(
    "/logout/all-other",
    protectRoute,
    authGeneralLimiter,
    controllers.logoutAllOtherDevices
);
router.post(
    "/logout/:targetLoginHistoryID",
    protectRoute,
    authGeneralLimiter,
    controllers.logoutParticularDevice
);
router.post("/email-logout", authGeneralLimiter, controllers.emailLogout);

router.get("/me", protectRoute, authGeneralLimiter, controllers.me);

router.get("/login-history", protectRoute, authGeneralLimiter, controllers.loginHistory);

router.get(
    "/check-username/:username",
    usernameCheckLimiter,
    controllers.checkUsernameAvailability
);

export default router;
