# OTP Format Migration: 6-digit Numeric → 8-character Uppercase Alphanumeric

**Date:** 2026-09-05
**Status:** Approved — pending implementation
**Scope:** All OTP generation, validation, and input handling across server and client

---

## 1. Goal

Migrate Trimium's OTP system from 6-digit numeric codes to 8-character uppercase alphanumeric codes drawn from a 32-character alphabet. This substantially increases entropy and aligns with industry practice for email-based verification.

### Why

- 6 digits = 10^6 = 1,000,000 combinations — easily brute-forced if rate limits fail.
- 8 chars from 32-character alphabet = 32^8 ≈ 1.1 trillion combinations.
- The new format excludes confusable characters (`0`, `1`, `I`, `O`), reducing user error when reading/transcribing the code from email.

---

## 2. Target Format

| Property         | Value                                                      |
| ---------------- | ---------------------------------------------------------- |
| Length           | 8 characters                                               |
| Character set    | `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (32 chars)              |
| Excluded         | `0`, `1`, `I`, `O` (visually confusable)                   |
| Case             | Uppercase only (server generates uppercase; client uppercases input) |
| Storage          | Plain string in Redis (no encoding change needed)          |
| TTL              | Unchanged: 5 min, 15 min after verification, lock after 3 wrong attempts |
| Rate limits      | Unchanged: 15-min window / 5 attempts per IP               |

### Validation regex (both client and server)

```regex
/^(?!.*\s)[2-9A-HJ-NP-Z]{8}$/
```

- `^(?!.*\s)` — rejects any whitespace
- `[2-9A-HJ-NP-Z]{8}` — exactly 8 chars from the 32-char set
- Case-sensitive: lowercase letters fail validation (client must uppercase before sending)

---

## 3. Files to Change

### Server (3 files)

| File                                                | Change                                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `server/src/utils/generateOTP.ts`                   | Replace `crypto.randomInt(0, 1000000)` + padStart with a 32-char alphabet loop      |
| `server/src/constants/regex.ts`                     | Update `OTP` regex; update `OTP_NOTICE` string                                      |
| `server/src/utils/emailTemplates.ts`                | Update `otpCard` caption copy if needed for the new format                          |

### Client (4 files)

| File                                                | Change                                                                              |
| --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `client/src/constants/regex.ts`                     | Mirror the server regex update and `OTP_NOTICE`                                     |
| `client/src/components/ui/input-otp.tsx`            | No code change (wrapper passes through)                                             |
| `client/src/components/create-account-forms.tsx`    | Update slot count, pattern, onChange (uppercase), and "6-digit" copy                |
| `client/src/components/reset-password-forms.tsx`    | Same changes as above                                                               |

### Files NOT changed

- Redis storage shape (`{ OTP, expiresAt, status, failedAttempts }`) — already a string, format-agnostic
- Auth routes (`server/src/modules/auth/routes.ts`) — no logic depends on format
- Auth controllers — only Zod schema references change via the regex constant
- Rate limit / PoW middleware — no format dependency
- Email subject lines, body structure, request-details table — only the `otpCard` code-display area may need minor spacing tweaks
- Stores (`create-account-store.ts`, `reset-password-store.ts`) — store strings, no format logic

---

## 4. Implementation Details

### 4.1 `generateOTP.ts`

```ts
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const LENGTH = 8;

export const generateOTP = (): string => {
    const chars = new Array<string>(LENGTH);
    for (let i = 0; i < LENGTH; i++) {
        chars[i] = ALPHABET[crypto.randomInt(0, ALPHABET.length)];
    }
    return chars.join("");
};
```

- Uses `crypto.randomInt` (cryptographically secure)
- No padding needed (fixed length, drawn from fixed alphabet)

### 4.2 Regex constants

Both `server/src/constants/regex.ts` and `client/src/constants/regex.ts`:

```ts
export const OTP = /^(?!.*\s)[2-9A-HJ-NP-Z]{8}$/;
export const OTP_NOTICE =
    "OTP must be exactly 8 characters (2-9, A-Z excluding confusables) and must not contain spaces.";
```

### 4.3 Client input handling

For each form using OTP (`create-account-forms.tsx`, `reset-password-forms.tsx`):

1. Change `REGEXP_ONLY_DIGITS` to a custom pattern string `"[2-9A-HJ-NP-Z]"` passed via the `pattern` prop of `InputOTP`.
2. Change `maxLength={6}` to `maxLength={8}`.
3. Add two more `InputOTPSlot`s (indices 6, 7) inside a new `InputOTPGroup` (or extend the existing layout).
4. Update `onChange` to uppercase the value:

   ```tsx
   onChange={(v) => setOTP(v.toUpperCase())}
   ```

5. Update user-facing copy:
   - "We'll send a 6-digit verification code to this email." → "We'll send an 8-character verification code to this email."
   - "Enter the 6-digit code we sent to your email address." → "Enter the 8-character code we sent to your email address."

### 4.4 Email template

The `otpCard` helper in `emailTemplates.ts` renders the OTP at 34px monospace with 10px letter spacing. The current letter-spacing helps disambiguate at 6 chars; with 8 chars and uppercase, verify the layout still looks balanced. If the code wraps or feels cramped:

- Reduce `letter-spacing` from 10px to 6–8px, OR
- Widen the container's max-width, OR
- Reduce font-size slightly (e.g., 30px)

**Decision rule:** if the 8-char code fits on one line at 34px / 10px spacing in the current container on mobile (≥320px), no change is needed. If it overflows, apply the smallest fix that keeps it on one line.

---

## 5. Data Flow (unchanged)

```
User submits email
  → POST /api/v1/auth/otp
  → Server: generateOTP() → 8-char string from 32-char alphabet
  → Server: stores in Redis with 5-min TTL under upcomingEmail:${email} (or resetPassword:${email})
  → Server: sends email with code rendered in otpCard

User types 8 chars (auto-uppercased client-side, pattern-restricted)
  → POST /api/v1/auth/otp/verify
  → Server: Zod validates against new regex
  → Server: compares to stored OTP
  → On success: 15-min TTL extension (status = "VERIFIED")
  → On failure: increment failedAttempts; lock + delete after 3
```

---

## 6. Error Handling

| Failure mode                          | Where caught                                | User-facing behavior                                          |
| ------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| Invalid character (e.g., 0, 1, I, O)  | Client `input-otp` `pattern` prop           | Keystroke is silently blocked                                 |
| Lowercase letter typed                | Client `onChange` (toUpperCase)             | Auto-uppercased before being stored/sent                      |
| Wrong length                          | Client `input-otp` `maxLength`              | Slot stays empty until valid length reached                   |
| Invalid format (server)               | Zod schema in `verifyOTP*` controllers      | 400 with `OTP_NOTICE` message                                 |
| Wrong code                            | Controllers (compare + increment counter)   | 401 with "Invalid or expired verification code" message       |
| 3 wrong attempts                      | Controllers (delete key on 3rd failure)     | 401 with "Too many failed attempts. Please request a new code."|
| Old 6-digit code in Redis from before deploy | Zod schema rejects it                | User must request a new code (max 5-min disruption per in-flight code) |

---

## 7. Deployment Strategy

**Single coordinated release.** Server and client must deploy together:

- Server deployed first with new regex: would reject all 6-char client input → users broken
- Client deployed first with 8-slot input: server would reject 8-char codes → users broken
- **Therefore:** ship both in the same release, ideally by merging and deploying the same commit to both Vercel (client) and the VPS (server) on the same push to `main`.

The CI/CD pipeline already does this — one push to `main` triggers both Vercel build and the server deploy workflow. No special coordination needed beyond landing the change as a single PR.

### In-flight codes at deploy time

Any 6-digit codes in Redis when the new code deploys will fail the new regex on the next verify attempt. Users will see "Invalid verification code" and need to request a new one. The 5-min TTL caps the disruption.

**Mitigation (optional):** briefly clearing the Redis OTP keys during deploy. This is a `redis-cli DEL upcomingEmail:* resetPassword:*` — but since the impact is small and the fix is one button-click for the user, **no mitigation is recommended**.

---

## 8. Testing

The repository has no test infrastructure (confirmed during exploration: no test files, no test runner config, no test dependencies in any `package.json`). This is out of scope for this migration.

### Manual verification checklist (post-deploy)

- [ ] Request OTP from a fresh email → email arrives within 30s
- [ ] Email code matches the new format (8 chars, no 0/1/I/O)
- [ ] Type the code in the verify page → it auto-uppercases
- [ ] Try to type `0`, `1`, `I`, `O`, or lowercase → input blocks / uppercases
- [ ] Wrong code shows error message
- [ ] 3 wrong attempts locks the OTP (resend required)
- [ ] Resend after lock generates a new code
- [ ] Same flow for reset password
- [ ] Email layout on mobile (320px viewport) — 8-char code fits on one line
- [ ] No 6-digit references remain in any user-facing copy

---

## 9. Out of Scope

- Adding test infrastructure
- Changing the OTP TTL, rate limits, or attempt threshold
- Changing the Redis storage shape
- Adding features (e.g., QR-code-based OTP, TOTP)
- Migrating to a different auth flow (magic links, etc.)
- Localizing the OTP_NOTICE string

---

## 10. Risks

| Risk                                                                | Likelihood | Impact | Mitigation                                                                  |
| ------------------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------- |
| Format mismatch between client and server during partial deploy     | Low        | High   | Ship as single coordinated release; one PR, one push to main                |
| Email layout breaks on mobile with 8-char code                     | Medium     | Low    | Check post-deploy; reduce letter-spacing or font-size as needed             |
| User frustration from existing 6-digit codes failing post-deploy    | Low        | Low    | 5-min TTL caps disruption; "request new code" path is one click             |
| Copy references "6-digit" not all caught                            | Low        | Low    | Grep for "6-digit" / "6 digit" / "six digit" before merge                  |

---

## 11. Success Criteria

- All new OTP requests generate 8-char codes from the 32-char alphabet.
- All verify attempts validate against the new regex.
- All client input auto-uppercases and restricts invalid characters.
- All user-facing copy reflects the new format.
- No 6-digit references remain in the codebase.
- No new error categories introduced (existing 401/400 responses still cover the same conditions).
