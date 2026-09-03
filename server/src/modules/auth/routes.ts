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

/**
 * @openapi
 * /api/v1/auth/otp:
 *   post:
 *     tags: [Auth]
 *     summary: Send registration OTP
 *     description: Send an OTP to an email address for creating a new account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       409:
 *         description: User with given email already exists
 *       429:
 *         description: Too many requests
 */
router.post("/otp", otpLimiter, verifyTurnstileToken, controllers.sendOTPForCreateAccount);

/**
 * @openapi
 * /api/v1/auth/otp/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify registration OTP
 *     description: Verify the OTP sent for creating a new account.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, OTP]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               OTP:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/otp/verify", otpLimiter, controllers.verifyOTPForCreateAccount);

/**
 * @openapi
 * /api/v1/auth/accounts:
 *   post:
 *     tags: [Auth]
 *     summary: Create account
 *     description: Create a new account after successful OTP verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, firstName, lastName, username, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Account created successfully
 *       400:
 *         description: Invalid input or verification pending
 */
router.post("/accounts", otpLimiter, controllers.createAccount);

/**
 * @openapi
 * /api/v1/auth/otp/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send password reset OTP
 *     description: Send an OTP to initiate the password reset flow.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identity]
 *             properties:
 *               identity:
 *                 type: string
 *                 description: Email or username of the account
 *     responses:
 *       200:
 *         description: OTP sent successfully (if account exists)
 *       404:
 *         description: User not found
 */
router.post(
    "/otp/reset-password",
    otpLimiter,
    verifyTurnstileToken,
    controllers.sendOTPForResetPassword
);

/**
 * @openapi
 * /api/v1/auth/otp/reset-password/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify password reset OTP
 *     description: Verify the OTP sent for password reset.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identity, OTP]
 *             properties:
 *               identity:
 *                 type: string
 *                 description: Email or username
 *               OTP:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/otp/reset-password/verify", otpLimiter, controllers.verifyOTPForResetPassword);

/**
 * @openapi
 * /api/v1/auth/accounts/password:
 *   patch:
 *     tags: [Auth]
 *     summary: Set new password (reset)
 *     description: Set a new password after successful OTP verification in the reset password flow.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identity, password]
 *             properties:
 *               identity:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired OTP verification
 */
router.patch("/accounts/password", otpLimiter, controllers.setNewPasswordForResetPassword);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 *     description: Login with email/username and password. Sets authToken as an HTTP-only cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identity, password]
 *             properties:
 *               identity:
 *                 type: string
 *                 description: Email or username
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, tokens set as cookies
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests
 */
router.post("/login", loginLimiter, verifyTurnstileToken, controllers.login);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current device
 *     description: Logout the current device by invalidating the current session's token.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", protectRoute, authGeneralLimiter, controllers.logoutMyDevice);

/**
 * @openapi
 * /api/v1/auth/logout/all-other:
 *   post:
 *     tags: [Auth]
 *     summary: Logout all other devices
 *     description: Logout all other devices except the current one by incrementing the token version.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: All other devices logged out
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/logout/all-other",
    protectRoute,
    authGeneralLimiter,
    controllers.logoutAllOtherDevices
);

/**
 * @openapi
 * /api/v1/auth/logout/{targetLoginHistoryID}:
 *   post:
 *     tags: [Auth]
 *     summary: Logout specific device
 *     description: Logout a specific device by its login history ID.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: targetLoginHistoryID
 *         required: true
 *         schema:
 *           type: string
 *         description: The login history ID of the device to logout
 *     responses:
 *       200:
 *         description: Device logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
    "/logout/:targetLoginHistoryID",
    protectRoute,
    authGeneralLimiter,
    controllers.logoutParticularDevice
);

/**
 * @openapi
 * /api/v1/auth/email-logout:
 *   post:
 *     tags: [Auth]
 *     summary: Email logout
 *     description: Logout a device remotely via email revoke token. Used when a user has lost access to a device.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [revokeToken]
 *             properties:
 *               revokeToken:
 *                 type: string
 *                 description: The revoke token received via email
 *     responses:
 *       200:
 *         description: Device logged out successfully
 *       400:
 *         description: Invalid or expired revoke token
 */
router.post("/email-logout", authGeneralLimiter, controllers.emailLogout);

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user
 *     description: Get the currently authenticated user's profile information.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
router.get("/me", protectRoute, authGeneralLimiter, controllers.me);

/**
 * @openapi
 * /api/v1/auth/login-history:
 *   get:
 *     tags: [Auth]
 *     summary: Get login history
 *     description: Get the login history for the currently authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Login history retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/login-history", protectRoute, authGeneralLimiter, controllers.loginHistory);

/**
 * @openapi
 * /api/v1/auth/check-username/{username}:
 *   get:
 *     tags: [Auth]
 *     summary: Check username availability
 *     description: Check if a username is available for registration.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username to check
 *     responses:
 *       200:
 *         description: Username availability status
 *       400:
 *         description: Invalid username format
 */
router.get(
    "/check-username/:username",
    usernameCheckLimiter,
    controllers.checkUsernameAvailability
);

export default router;
