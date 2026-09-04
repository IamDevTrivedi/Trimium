# Server Error Message Audit

> Audited: 2026-09-05
> Total errors found: 166 | GOOD: 86 | BAD: 80

## BAD Messages (flagged for improvement)

| # | File | Line | Message | Status | Issue |
|---|------|------|---------|--------|-------|
| 1 | server/src/modules/auth/controllers.ts | 48 | "Invalid request" | 400 | Too generic, doesn't specify what was invalid |
| 2 | server/src/modules/auth/controllers.ts | 101 | "Error in initlising account creation" | 500 | Typo "initlising" should be "initialising", vague message |
| 3 | server/src/modules/auth/controllers.ts | 118 | "Invalid request" | 400 | Too generic |
| 4 | server/src/modules/auth/controllers.ts | 205 | "Error in verifying OTP for Account Creation" | 500 | Vague, doesn't specify what operation failed |
| 5 | server/src/modules/auth/controllers.ts | 231 | "Invalid request" | 400 | Too generic |
| 6 | server/src/modules/auth/controllers.ts | 299 | "Error in creating account" | 500 | Vague |
| 7 | server/src/modules/auth/controllers.ts | 315 | "Invalid request" | 400 | Too generic |
| 8 | server/src/modules/auth/controllers.ts | 374 | "Error in sending OTP for Reset Password" | 500 | Vague |
| 9 | server/src/modules/auth/controllers.ts | 391 | "Invalid request" | 400 | Too generic |
| 10 | server/src/modules/auth/controllers.ts | 502 | "Error in verifying OTP for Reset Password" | 500 | Vague |
| 11 | server/src/modules/auth/controllers.ts | 521 | "Invalid request" | 400 | Too generic |
| 12 | server/src/modules/auth/controllers.ts | 590 | "Error in setting new password for Reset Password" | 500 | Vague |
| 13 | server/src/modules/auth/controllers.ts | 607 | "Invalid request" | 400 | Too generic |
| 14 | server/src/modules/auth/controllers.ts | 780 | "Error in login" | 500 | Vague |
| 15 | server/src/modules/auth/controllers.ts | 823 | "Error in logging out from my device" | 500 | Vague |
| 16 | server/src/modules/auth/controllers.ts | 890 | "Error in logging out from all devices" | 500 | Vague |
| 17 | server/src/modules/auth/controllers.ts | 906 | "Invalid request" | 400 | Too generic |
| 18 | server/src/modules/auth/controllers.ts | 959 | "Error in logging out from particular device" | 500 | Vague |
| 19 | server/src/modules/auth/controllers.ts | 989 | "Error in fetching current user details" | 500 | Vague |
| 20 | server/src/modules/auth/controllers.ts | 1007 | "Invalid request" | 400 | Too generic |
| 21 | server/src/modules/auth/controllers.ts | 1070 | "Error in fetching login history" | 500 | Vague |
| 22 | server/src/modules/auth/controllers.ts | 1086 | "Invalid request" | 400 | Too generic |
| 23 | server/src/modules/auth/controllers.ts | 1117 | "Error in checking username availability" | 500 | Vague |
| 24 | server/src/modules/auth/controllers.ts | 1134 | "Invalid request" | 400 | Too generic |
| 25 | server/src/modules/auth/controllers.ts | 1230 | "Error in email logout" | 500 | Vague |
| 26 | server/src/modules/user/controllers.ts | 38 | "Invalid request data" | 400 | Too generic |
| 27 | server/src/modules/user/controllers.ts | 76 | "Internal Server Error" | 500 | Too generic |
| 28 | server/src/modules/user/controllers.ts | 98 | "Invalid request data" | 400 | Too generic |
| 29 | server/src/modules/user/controllers.ts | 142 | "Internal Server Error" | 500 | Too generic |
| 30 | server/src/modules/user/controllers.ts | 161 | "Invalid request data" | 400 | Too generic |
| 31 | server/src/modules/user/controllers.ts | 207 | "Internal Server Error" | 500 | Too generic |
| 32 | server/src/modules/workspace/controllers.ts | 51 | "Invalid request data" | 400 | Too generic |
| 33 | server/src/modules/workspace/controllers.ts | 136 | "Internal Server Error" | 500 | Too generic |
| 34 | server/src/modules/workspace/controllers.ts | 175 | "Internal Server Error" | 500 | Too generic |
| 35 | server/src/modules/workspace/controllers.ts | 191 | "Invalid request data" | 400 | Too generic |
| 36 | server/src/modules/workspace/controllers.ts | 207 | "Invalid request data" | 400 | Too generic |
| 37 | server/src/modules/workspace/controllers.ts | 292 | "Internal Server Error" | 500 | Too generic |
| 38 | server/src/modules/workspace/controllers.ts | 327 | "Internal Server Error" | 500 | Too generic |
| 39 | server/src/modules/workspace/controllers.ts | 344 | "Invalid request data" | 400 | Too generic |
| 40 | server/src/modules/workspace/controllers.ts | 406 | "Internal Server Error" | 500 | Too generic |
| 41 | server/src/modules/workspace/controllers.ts | 421 | "Invalid Request" | 400 | Too generic |
| 42 | server/src/modules/workspace/controllers.ts | 459 | "Invalid Request" | 400 | Too generic |
| 43 | server/src/modules/workspace/controllers.ts | 596 | "Internal Server Error" | 500 | Too generic |
| 44 | server/src/modules/workspace/controllers.ts | 613 | "Invalid request data" | 400 | Too generic |
| 45 | server/src/modules/workspace/controllers.ts | 681 | "Internal Server Error" | 500 | Too generic |
| 46 | server/src/modules/workspace/controllers.ts | 698 | "Invalid request data" | 400 | Too generic |
| 47 | server/src/modules/workspace/controllers.ts | 749 | "Internal Server Error" | 500 | Too generic |
| 48 | server/src/modules/workspace/controllers.ts | 766 | "Invalid request data" | 400 | Too generic |
| 49 | server/src/modules/workspace/controllers.ts | 782 | "Invalid request data" | 400 | Too generic |
| 50 | server/src/modules/workspace/controllers.ts | 835 | "Internal Server Error" | 500 | Too generic |
| 51 | server/src/modules/workspace/controllers.ts | 851 | "Invalid request data" | 400 | Too generic |
| 52 | server/src/modules/workspace/controllers.ts | 877 | "Invalid request data" | 400 | Too generic |
| 53 | server/src/modules/workspace/controllers.ts | 977 | "Internal Server Error" | 500 | Too generic |
| 54 | server/src/modules/workspace/controllers.ts | 993 | "Invalid Request" | 400 | Too generic |
| 55 | server/src/modules/workspace/controllers.ts | 1051 | "Failed to delete workspace" | 500 | Somewhat specific but still generic |
| 56 | server/src/modules/workspace/controllers.ts | 1063 | "Internal Server Error" | 500 | Too generic |
| 57 | server/src/modules/workspace/controllers.ts | 1081 | "Invalid request data" | 400 | Too generic |
| 58 | server/src/modules/workspace/controllers.ts | 1134 | "Internal Server Error" | 500 | Too generic |
| 59 | server/src/modules/workspace/controllers.ts | 1151 | "Invalid request data" | 400 | Too generic |
| 60 | server/src/modules/workspace/controllers.ts | 1197 | "Internal Server Error" | 500 | Too generic |
| 61 | server/src/modules/url/controllers.ts | 37 | "Invalid request data" | 400 | Too generic |
| 62 | server/src/modules/url/controllers.ts | 67 | "Internal Server Error" | 500 | Too generic |
| 63 | server/src/modules/url/controllers.ts | 128 | "Invalid request data" | 400 | Too generic |
| 64 | server/src/modules/url/controllers.ts | 256 | "Internal Server Error" | 500 | Too generic |
| 65 | server/src/modules/url/controllers.ts | 276 | "Invalid request data" | 400 | Too generic |
| 66 | server/src/modules/url/controllers.ts | 320 | "Internal Server Error" | 500 | Too generic |
| 67 | server/src/modules/url/controllers.ts | 338 | "Invalid shortcode" | 400 | Too generic, doesn't explain why |
| 68 | server/src/modules/url/controllers.ts | 390 | "Invalid request data" | 400 | Too generic |
| 69 | server/src/modules/url/controllers.ts | 495 | "Internal Server Error" | 500 | Too generic |
| 70 | server/src/modules/url/controllers.ts | 530 | "Invalid request data" | 400 | Too generic |
| 71 | server/src/modules/url/controllers.ts | 558 | "Analytics data not found" | 500 | Vague for 500 error |
| 72 | server/src/modules/url/controllers.ts | 754 | "Internal Server Error" | 500 | Too generic |
| 73 | server/src/modules/url/controllers.ts | 777 | "Invalid request data" | 400 | Too generic |
| 74 | server/src/modules/url/controllers.ts | 848 | "Internal Server Error" | 500 | Too generic |
| 75 | server/src/modules/url/controllers.ts | 869 | "Invalid request data" | 400 | Too generic |
| 76 | server/src/modules/url/controllers.ts | 1009 | "Internal Server Error" | 500 | Too generic |
| 77 | server/src/modules/url/controllers.ts | 1058 | "Invalid request data" | 400 | Too generic |
| 78 | server/src/modules/url/controllers.ts | 1233 | "Internal Server Error" | 500 | Too generic |
| 79 | server/src/modules/url/controllers.ts | 1249 | "Invalid shortcode" | 400 | Too generic |
| 80 | server/src/modules/url/controllers.ts | 1307 | "Internal Server Error" | 500 | Too generic |
| 81 | server/src/modules/url/controllers.ts | 1323 | "Invalid shortcode" | 400 | Too generic |
| 82 | server/src/modules/url/controllers.ts | 1350 | "Invalid request data" | 400 | Too generic |
| 83 | server/src/modules/url/controllers.ts | 1447 | "Internal Server Error" | 500 | Too generic |
| 84 | server/src/modules/linkhub/controllers.ts | 45 | "Internal Server Error" | 500 | Too generic |
| 85 | server/src/modules/linkhub/controllers.ts | 91 | "Invalid request data" | 400 | Too generic |
| 86 | server/src/modules/linkhub/controllers.ts | 126 | "Internal Server Error" | 500 | Too generic |
| 87 | server/src/modules/linkhub/controllers.ts | 143 | "Invalid username" | 400 | Too generic |
| 88 | server/src/modules/linkhub/controllers.ts | 196 | "Internal Server Error" | 500 | Too generic |
| 89 | server/src/modules/linkhub/controllers.ts | 268 | "Failed to upload avatar" | 500 | Vague |
| 90 | server/src/modules/contact/controller.ts | 28 | "Invalid request data" | 400 | Too generic |
| 91 | server/src/modules/contact/controller.ts | 69 | "Internal server error" | 500 | Too generic |
| 92 | server/src/middlewares/protectRoute.ts | 73 | "Internal server error" | 500 | Too generic |
| 93 | server/src/middlewares/rateLimiter.ts | 76 | "Invalid PoW header." | 400 | Too technical, vague |
| 94 | server/src/middlewares/rateLimiter.ts | 84 | "Invalid PoW header format." | 400 | Too technical |
| 95 | server/src/middlewares/rateLimiter.ts | 95 | "Invalid PoW token format." | 400 | Too technical |
| 96 | server/src/middlewares/rateLimiter.ts | 105 | "PoW challenge has expired." | 400 | Too technical |
| 97 | server/src/middlewares/rateLimiter.ts | 117 | "Invalid PoW token integrity." | 400 | Too technical |
| 98 | server/src/middlewares/rateLimiter.ts | 129 | "Invalid PoW solution." | 400 | Too technical |
| 99 | server/src/middlewares/verifyTurnstile.ts | 82 | "Internal server error" | 500 | Too generic |

## Recommendations

### Priority 1: Replace all "Internal Server Error" messages (500)
These are the most common BAD messages. For 500 errors, consider messages like:
- "Failed to save changes to the database"
- "Unable to process your request at this time"
- "Something went wrong while [specific operation]"

### Priority 2: Replace all "Invalid request" / "Invalid request data" messages (400)
For Zod validation errors, the detailed error is already included via `z.treeifyError()`. Consider:
- "Please check your request and try again" (but keep the Zod errors for detail)
- Or simply rely on the Zod error details if the generic message is removed

### Priority 3: Replace all "Error in [operation]" messages (500)
Be more specific about what failed:
- "Failed to send verification email" instead of "Error in sending OTP"
- "Failed to process your login" instead of "Error in login"

### Priority 4: Fix technical PoW messages in rateLimiter
These should be user-friendly:
- "Invalid PoW header" -> "Security verification failed. Please refresh and try again."
- "PoW challenge has expired" -> "Your security verification has expired. Please refresh the page."
