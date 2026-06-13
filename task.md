# API RESTful Redesign - Trimium

## Goal
Refactor all API endpoints to follow RESTful principles: proper HTTP methods (GET/POST/PATCH/DELETE), resource-oriented paths, and correct status codes.

## Execution Pattern
For each module: **1) Edit server routes + controllers → 2) Edit client files calling those endpoints** → Mark complete

## Module Execution Order (smallest → largest)

### Module 1: Contact
**Server** (`/api/v1/contact`):
- [x] Rename `POST /submit` → `POST /`

**Client**:
- [x] `contact-form.tsx`: `/api/v1/contact/submit` → `POST /api/v1/contact`

---

### Module 2: User
**Server** (`/api/v1/user`):
- [x] `POST /change-name` → `PATCH /name`
- [x] `POST /change-password` → `PATCH /password`
- [x] `POST /change-username` → `PATCH /username`

**Client**:
- [x] `account-page.tsx`: Update all 3 user endpoint calls

---

### Module 3: Linkhub
**Server** (`/api/v1/linkhub`):
- [x] `POST /get-my-profile` → `GET /me`
- [x] `POST /update-my-profile` → `PUT /me`
- [x] `POST /update-avatar` → `POST /me/avatar`
- [x] `POST /public-profile` → `GET /u/{username}`

**Client**:
- [x] `linkhub-editor.tsx`: Update all 3 calls
- [x] `t/[username]/page.tsx`: Update public profile call

---

### Module 4: URL
**Server** (`/api/v1/url`):
- [x] `POST /is-shortcode-available` → `GET /check/{shortCode}`
- [x] `POST /create-shortcode` → `POST /`
- [x] `POST /bulk-create-shortcodes` → `POST /bulk`
- [x] `POST /get-shortcode-info` → `GET /{shortCode}`
- [x] `POST /edit-shortcode` → `PATCH /{shortCode}`
- [x] `POST /shortcode-performance` → `GET /{shortCode}/analytics`
- [x] `POST /export-analytics` → `GET /{shortCode}/analytics/export`
- [x] `POST /redirect` → keep as `POST /redirect` (body needs password)
- [x] Fix redirect status codes: INVALID→404, EXPIRED→410, INACTIVE→423, SHOW_COUNTER→425, MAX_TRANSFER→429, PASSWORD_REQ→401, WRONG_PASSWORD→403
- [x] Move tag-on-shortcode ops from workspace: `GET /{shortCode}/tags`, `PATCH /{shortCode}/tags`

**Client**:
- [x] `create-redirect-form.tsx`: Update check + create calls
- [x] `edit-redirect-form.tsx`: Update get-info + edit calls
- [x] `bulk-upload-urls.tsx`: Update bulk create call
- [x] `shortcode-performance.tsx`: Update analytics + export calls
- [x] `shortcode-tags.tsx`: Update tag calls (moved to url module)
- [x] `r/[shortCode]/page.tsx`: No change (redirect kept as POST)

---

### Module 5: Workspace
**Server** (`/api/v1/workspace`):
- [x] `POST /create-workspace` → `POST /`
- [x] `POST /my-workspaces` → `GET /`
- [x] `POST /get-workspace-details` → `GET /{workspaceID}`
- [x] `POST /sudo-update-workspace` → `PATCH /{workspaceID}`
- [x] `POST /sudo-update-workspace` (delete) → `DELETE /{workspaceID}` (new controller)
- [x] `POST /leave-workspace` → `POST /{workspaceID}/leave`
- [x] `POST /workspace-permission` → `GET /{workspaceID}/permission`
- [x] `POST /create-tag` → `POST /{workspaceID}/tags`
- [x] `POST /update-tag` → `PATCH /{workspaceID}/tags`
- [x] `POST /delete-tag` → `DELETE /{workspaceID}/tags/{tag}`
- [x] `POST /get-tags` (with workspaceID) → `GET /{workspaceID}/tags`
- [x] Tag-on-shortcode ops moved to URL module: `GET /{shortCode}/tags`, `PATCH /{shortCode}/tags`
- [x] `POST /get-all-invitations` → `GET /invitations`
- [x] `POST /accept-or-decline-invitation` (body `{invitationID}`) → `PATCH /invitations/{invitationID}` (params `{invitationID}`, body `{accept}`)

**Client**:
- [x] `workspace-list.tsx`: Update my-workspaces call
- [x] `create-workspace-form.tsx`: Update create call
- [x] `workspace-details.tsx`: Update details + update + leave + delete calls
- [x] `protect-workspace.tsx`: Update permission check call
- [x] `pending-invitations.tsx`: Update invitations calls
- [x] `workspace-tags.tsx`: Update all tag CRUD calls
- [x] `shortcode-tags.tsx`: Update workspace tag fetch call
- [x] `workspace-performance.tsx`: Update workspace tag fetch call

---

### Module 6: Auth
**Server** (`/api/v1/auth`):
- [x] `POST /send-otp-for-create-account` → `POST /otp`
- [x] `POST /verify-otp-for-create-account` → `POST /otp/verify`
- [x] `POST /create-account` → `POST /accounts`
- [x] `POST /reset-password/send-otp` → `POST /otp/reset-password`
- [x] `POST /reset-password/verify-otp` → `POST /otp/reset-password/verify`
- [x] `POST /reset-password/set-new-password` → `PATCH /accounts/password`
- [x] `POST /login` → keep `POST /login`
- [x] `POST /logout-my-device` → `POST /logout`
- [x] `POST /logout-all-other-devices` → `POST /logout/all-other`
- [x] `POST /logout-particular-device` (body `{targetLoginHistoryID}`) → `POST /logout/{targetLoginHistoryID}` (params)
- [x] `POST /email-logout` → keep `POST /email-logout`
- [x] `POST /me` → `GET /me`
- [x] `POST /login-history` → `GET /login-history` (query `targetLoginHistoryID?`)
- [x] `POST /check-username` (body `{usernameToCheck}`) → `GET /check-username/{username}` (params)

**Client**:
- [x] `create-account-forms.tsx`: Update send-otp, verify-otp, create-account, check-username
- [x] `login-forms.tsx`: No change (login endpoint unchanged)
- [x] `reset-password-forms.tsx`: Update all 3 reset-password calls
- [x] `protect-page.tsx`: Update /me call to GET
- [x] `login-history.tsx`: Update login-history + logout-device + logout-others calls
- [x] `account-page.tsx`: Update check-username + logout-others
- [x] `logout/page.tsx`: Update logout-my-device call
- [x] `email-logout/page.tsx`: No change

---

## Audit Summary
All 48 endpoints across 6 modules have been refactored and verified. Every server route + controller validation schema was cross-checked against every client call (method, URL, body params, query params, route params). Build passes for both server and client.
