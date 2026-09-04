# OTP Format Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate Trimium's OTP system from 6-digit numeric to 8-character uppercase alphanumeric (32-char alphabet), keeping all security parameters, storage shape, and rate limits unchanged.

**Architecture:** Format change only. Server regenerates codes from a 32-char alphabet, both client and server validate with a new regex, client auto-uppercases input and restricts the input mask. No new endpoints, no Redis changes, no test infrastructure required (the repo has none).

**Tech Stack:** Bun 1.4.0, Next.js 16, Express 5, TypeScript 7, `input-otp` library, Redis (native), Mongoose.

**Spec:** `docs/superpowers/specs/2026-09-05-otp-migration-design.md`

---

## Global Constraints

- **Alphabet (32 chars):** `23456789ABCDEFGHJKLMNPQRSTUVWXYZ` (excludes `0`, `1`, `I`, `O`)
- **Length:** 8
- **Validation regex (client + server):** `/^(?!.*\s)[2-9A-HJ-NP-Z]{8}$/`
- **OTP_NOTICE string:** "OTP must be exactly 8 characters (2-9, A-Z excluding confusables) and must not contain spaces."
- **Crypto:** `crypto.randomInt(0, 32)` for index generation
- **Quality gates:** Husky pre-commit runs `bun run check` (Biome lint + format). Every commit must pass.
- **No test infrastructure** exists; all verification is manual per the spec's checklist.
- **No git commits** without explicit user permission (per `AGENTS.md` Critical Rules).

---

## File Map

| File                                                  | Action  | Responsibility                                                     |
| ----------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| `server/src/utils/generateOTP.ts`                     | Modify  | Generate 8-char code from 32-char alphabet using `crypto.randomInt` |
| `server/src/constants/regex.ts`                       | Modify  | Update `OTP` regex + `OTP_NOTICE`                                  |
| `server/src/utils/emailTemplates.ts`                  | Modify  | Reduce `otpCard` letter-spacing to fit 8 chars on one line         |
| `client/src/constants/regex.ts`                       | Modify  | Mirror the server regex + `OTP_NOTICE`                             |
| `client/src/components/create-account-forms.tsx`      | Modify  | Slot count, pattern, onChange (uppercase), copy strings            |
| `client/src/components/reset-password-forms.tsx`      | Modify  | Same as above                                                      |

Files NOT changed: stores (format-agnostic), routes/controllers (use regex constant), rate-limit middleware, Redis shape, email subject lines/body, all other auth components.

---

### Task 1: Update server OTP generation

**Files:**
- Modify: `server/src/utils/generateOTP.ts`

- [ ] **Step 1: Replace the file contents**

Replace the entire body of `server/src/utils/generateOTP.ts` with:

```ts
import crypto from "crypto";

const OTP_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const OTP_LENGTH = 8;

export const generateOTP = (): string => {
    const chars: string[] = new Array(OTP_LENGTH);
    for (let i = 0; i < OTP_LENGTH; i++) {
        chars[i] = OTP_ALPHABET[crypto.randomInt(0, OTP_ALPHABET.length)];
    }
    return chars.join("");
};
```

- [ ] **Step 2: Verify the file**

Run: `cat server/src/utils/generateOTP.ts`
Expected: File shows the new 8-char alphabet-based implementation. No `padStart`, no `1000000`.

- [ ] **Step 3: Run typecheck**

Run: `cd server && bun run typecheck`
Expected: PASS, no errors.

- [ ] **Step 4: Commit (with user permission)**

```bash
git add server/src/utils/generateOTP.ts
git commit -m "feat(otp): generate 8-char alphanumeric codes from 32-char alphabet"
```

---

### Task 2: Update server regex + notice

**Files:**
- Modify: `server/src/constants/regex.ts`

- [ ] **Step 1: Update `OTP` regex**

In `server/src/constants/regex.ts`, change line 5:

```ts
export const OTP = /^(?!.*\s)[2-9A-HJ-NP-Z]{8}$/;
```

(from `export const OTP = /^(?!.*\s)\d{6}$/;`)

- [ ] **Step 2: Update `OTP_NOTICE` string**

In the same file, change line 16:

```ts
export const OTP_NOTICE =
    "OTP must be exactly 8 characters (2-9, A-Z excluding confusables) and must not contain spaces.";
```

(from `export const OTP_NOTICE = "OTP must be exactly 6 digits and must not contain spaces.";`)

- [ ] **Step 3: Run typecheck**

Run: `cd server && bun run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit (with user permission)**

```bash
git add server/src/constants/regex.ts
git commit -m "feat(otp): update server regex to 8-char alphanumeric format"
```

---

### Task 3: Update client regex + notice

**Files:**
- Modify: `client/src/constants/regex.ts`

- [ ] **Step 1: Update `OTP` regex**

In `client/src/constants/regex.ts`, change line 5:

```ts
export const OTP = /^(?!.*\s)[2-9A-HJ-NP-Z]{8}$/;
```

(from `export const OTP = /^(?!.*\s)\d{6}$/;`)

- [ ] **Step 2: Update `OTP_NOTICE` string**

In the same file, change line 16:

```ts
export const OTP_NOTICE =
    "OTP must be exactly 8 characters (2-9, A-Z excluding confusables) and must not contain spaces.";
```

(from `export const OTP_NOTICE = "OTP must be exactly 6 digits and must not contain spaces.";`)

- [ ] **Step 3: Run typecheck**

Run: `cd client && bun run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit (with user permission)**

```bash
git add client/src/constants/regex.ts
git commit -m "feat(otp): update client regex to 8-char alphanumeric format"
```

---

### Task 4: Update `otpCard` email template

**Files:**
- Modify: `server/src/utils/emailTemplates.ts` (around line 119-127)

- [ ] **Step 1: Reduce letter-spacing in `otpCard`**

In `server/src/utils/emailTemplates.ts`, in the `otpCard` function (around line 119-127), change the `letter-spacing:10px;` value to `letter-spacing:6px;` in the `<p class="tb-otp">` tag. The full line should become:

```ts
            <p class="tb-otp" style="margin:12px 0 8px;color:${C.primary};font-family:${MONO_FONT_STACK};font-size:34px;font-weight:700;letter-spacing:6px;line-height:1.1;">${safeText(OTP)}</p>
```

(from `letter-spacing:10px;`)

- [ ] **Step 2: Verify the change**

Run: `grep -n "letter-spacing" server/src/utils/emailTemplates.ts`
Expected: One match in `otpCard` showing `letter-spacing:6px`.

- [ ] **Step 3: Commit (with user permission)**

```bash
git add server/src/utils/emailTemplates.ts
git commit -m "feat(otp): tighten otpCard letter-spacing for 8-char codes"
```

---

### Task 5: Update create-account form

**Files:**
- Modify: `client/src/components/create-account-forms.tsx`

- [ ] **Step 1: Replace `REGEXP_ONLY_DIGITS` import with `REGEXP_ONLY_DIGITS_AND_CHARS`**

Change line 13:

```ts
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
```

(from `import { REGEXP_ONLY_DIGITS } from "input-otp";`)

- [ ] **Step 2: Update the email description copy**

Change line 106:

```tsx
                        We&apos;ll send an 8-character verification code to this email.
```

(from `                        We&apos;ll send a 6-digit verification code to this email.`)

- [ ] **Step 3: Update the `InputOTP` component for `CreateAccountVerify`**

In the `CreateAccountVerify` function (around line 215-241), replace the entire `<InputOTP ...>...</InputOTP>` block with:

```tsx
                    <div className="flex justify-center">
                        <InputOTP
                            id="otp"
                            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                            maxLength={8}
                            value={OTP}
                            onChange={(v) => setOTP(v.toUpperCase())}
                            required
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} className="size-10 sm:size-8" />
                                <InputOTPSlot index={1} className="size-10 sm:size-8" />
                                <InputOTPSlot index={2} className="size-10 sm:size-8" />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} className="size-10 sm:size-8" />
                                <InputOTPSlot index={4} className="size-10 sm:size-8" />
                                <InputOTPSlot index={5} className="size-10 sm:size-8" />
                                <InputOTPSlot index={6} className="size-10 sm:size-8" />
                                <InputOTPSlot index={7} className="size-10 sm:size-8" />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
```

Key changes from the original:
- `pattern={REGEXP_ONLY_DIGITS}` → `pattern={REGEXP_ONLY_DIGITS_AND_CHARS}`
- `maxLength={6}` → `maxLength={8}`
- `onChange={setOTP}` → `onChange={(v) => setOTP(v.toUpperCase())}`
- Added 2 more `InputOTPSlot`s (indices 6, 7) inside the second `InputOTPGroup`

- [ ] **Step 4: Update the verify-page description copy**

In the same function, change line 243:

```tsx
                        Enter the 8-character code we sent to your email address.
```

(from `                        Enter the 6-digit code we sent to your email address.`)

- [ ] **Step 5: Verify no stale references remain**

Run: `grep -n "REGEXP_ONLY_DIGITS\b\|6-digit\|maxLength={6}" client/src/components/create-account-forms.tsx`
Expected: No matches (only `REGEXP_ONLY_DIGITS_AND_CHARS` should appear).

- [ ] **Step 6: Run typecheck**

Run: `cd client && bun run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit (with user permission)**

```bash
git add client/src/components/create-account-forms.tsx
git commit -m "feat(otp): migrate create-account form to 8-char alphanumeric input"
```

---

### Task 6: Update reset-password form

**Files:**
- Modify: `client/src/components/reset-password-forms.tsx`

- [ ] **Step 1: Replace `REGEXP_ONLY_DIGITS` import with `REGEXP_ONLY_DIGITS_AND_CHARS`**

Change line 11:

```ts
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
```

(from `import { REGEXP_ONLY_DIGITS } from "input-otp";`)

- [ ] **Step 2: Update the email description copy**

Change line 110:

```tsx
                        We&apos;ll send an 8-character Verification Code to registered email.
```

(from `                        We&apos;ll send a 6-digit Verification Code to registered email.`)

- [ ] **Step 3: Update the `InputOTP` component for `ResetPasswordVerify`**

In the `ResetPasswordVerify` function (around line 207-232), replace the entire `<InputOTP ...>...</InputOTP>` block with:

```tsx
                    <div className="flex justify-center">
                        <InputOTP
                            id="otp"
                            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                            maxLength={8}
                            value={OTP}
                            onChange={(v) => setOTP(v.toUpperCase())}
                            required
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                                <InputOTPSlot index={6} />
                                <InputOTPSlot index={7} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
```

Key changes from the original:
- `pattern={REGEXP_ONLY_DIGITS}` → `pattern={REGEXP_ONLY_DIGITS_AND_CHARS}`
- `maxLength={6}` → `maxLength={8}`
- `onChange={setOTP}` → `onChange={(v) => setOTP(v.toUpperCase())}`
- Added 2 more `InputOTPSlot`s (indices 6, 7) inside the second `InputOTPGroup`

- [ ] **Step 4: Update the verify-page description copy**

In the same function, change line 234:

```tsx
                        Enter the 8-character code we sent to your email address.
```

(from `                        Enter the 6-digit code we sent to your email address.`)

- [ ] **Step 5: Verify no stale references remain**

Run: `grep -n "REGEXP_ONLY_DIGITS\b\|6-digit\|maxLength={6}" client/src/components/reset-password-forms.tsx`
Expected: No matches (only `REGEXP_ONLY_DIGITS_AND_CHARS` should appear).

- [ ] **Step 6: Run typecheck**

Run: `cd client && bun run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit (with user permission)**

```bash
git add client/src/components/reset-password-forms.tsx
git commit -m "feat(otp): migrate reset-password form to 8-char alphanumeric input"
```

---

### Task 7: Final repo-wide verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm no stale references anywhere**

Run:
```bash
grep -rn "REGEXP_ONLY_DIGITS\b\|6-digit\|6 digit\|maxLength={6}" \
  server/src client/src \
  --include="*.ts" --include="*.tsx"
```

Expected: No matches. If anything is found, the relevant file was missed.

- [ ] **Step 2: Run typecheck on both packages**

Run:
```bash
cd server && bun run typecheck && cd ../client && bun run typecheck
```

Expected: Both PASS.

- [ ] **Step 3: Run the quality gate (lint + format)**

Run from the repo root: `bun run check`
Expected: PASS. If Biome flags formatting issues, run `bun run format` then re-check.

- [ ] **Step 4: Smoke-test OTP generation**

Run: `bun --eval "import('./server/src/utils/generateOTP.ts').then(m => { for (let i = 0; i < 5; i++) console.log(m.generateOTP()); })"`
Expected: 5 outputs, each 8 characters long, matching `/^[2-9A-HJ-NP-Z]{8}$/`. None should contain `0`, `1`, `I`, or `O`.

- [ ] **Step 5: Manual UI verification checklist (post-deploy, not in this task)**

This is the spec's Section 8 checklist — not done here, but tracked in the spec for the user to verify once deployed.

---

## Plan complete

Plan complete and saved to `docs/superpowers/plans/2026-09-05-otp-migration.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?

---

## Self-Review

I ran the writing-plans self-review checklist against the spec:

**1. Spec coverage:**
- ✅ Section 1 (Goal) — addressed in Global Constraints
- ✅ Section 2 (Target Format) — alphabet, length, regex, OTP_NOTICE all in Global Constraints
- ✅ Section 4.1 (`generateOTP.ts`) — Task 1
- ✅ Section 4.2 (Regex constants, both files) — Tasks 2 and 3
- ✅ Section 4.3 (Client input handling) — Tasks 5 and 6
- ✅ Section 4.4 (Email template) — Task 4
- ✅ Section 6 (Error handling) — implicit: regex enforces, `input-otp` pattern blocks keystrokes
- ✅ Section 8 (Manual verification checklist) — Task 7 Step 5 references the spec

**2. Placeholder scan:** No "TBD", "TODO", or vague steps. Every code block is exact.

**3. Type consistency:** Function names (`generateOTP`, `setOTP`), constants (`OTP`, `OTP_NOTICE`, `REGEXP_ONLY_DIGITS_AND_CHARS`), file paths, and line numbers all consistent across tasks.

No fixes needed.
