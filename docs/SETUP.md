# Trimium Setup Guide

A comprehensive guide to set up and run the Trimium application locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | v18+ | Required |
| pnpm | Latest | Required for workspace scripts |
| Git | Latest | Required for Husky pre-push hooks |
| MongoDB | Latest | Local or cloud (e.g., MongoDB Atlas) |
| Redis | Latest | Local or cloud (e.g., Redis Cloud) |
| MaxMind GeoLite2 | Latest | Optional, enhances location services |
| Brevo account | Latest | Required for transactional emails |
| Cloudinary account | Latest | Required for media uploads |

---

## 1. Clone the Repository

```bash
git clone https://github.com/IamDevTrivedi/Trimium
cd Trimium
```

---

## 2. Install Dependencies

From the root directory of the project, run:

```bash
# Using pnpm
pnpm run install:all
```

> This installs dependencies for root, client, and server workspaces.

> The root `prepare` script also initializes Husky hooks automatically.

---

## 3. Environment Configuration

This project uses environment files in multiple locations.

### 3.1 Environment Files Quick Map

| File Name | Location | Purpose | Required |
|-----------|----------|---------|----------|
| `.env` | Project root (`./.env`) | Root scripts configuration (MaxMind downloader) | Optional |
| `.env.development` | `server/.env.development` | Backend development runtime config | Yes (development) |
| `.env.production` | `server/.env.production` | Backend production runtime config | Yes (production) |
| `.env` | `client/.env` | Frontend public runtime config | Yes |

> All environment files are ignored by Git through `.gitignore` (`.env`, `.env.*`).

### 3.2 Root Environment File (`./.env`)

Used by `scripts/update-geolite2.js`.

| Variable | Required | Description | Where to get it |
|----------|----------|-------------|-----------------|
| `MAXMIND_LICENSE_KEY` | Optional | License key to download `GeoLite2-City.mmdb` automatically | MaxMind account license page: https://www.maxmind.com/en/accounts/current/license-key |

### 3.3 Server Environment Files (`server/.env.development`, `server/.env.production`)

The server loads one of these files based on `NODE_ENV` in `server/src/config/env.ts`.

Validation is enforced in `server/src/config/checkEnv.ts` (fail-fast on invalid values).

Create both files using `server/.env.example`, then set environment-specific values.

| Variable | Required | Description | Where to get it |
|----------|----------|-------------|-----------------|
| `PORT` | Yes | API server port (e.g., `5000`) | Choose locally or from hosting platform |
| `BACKEND_URL_DEV` | Yes | Development backend base URL | Local server URL (e.g., `http://localhost:5000`) |
| `BACKEND_URL_PROD` | Yes | Production backend base URL | Your deployed backend URL |
| `FRONTEND_URL_DEV` | Yes | Development frontend base URL | Local frontend URL (e.g., `http://localhost:3000`) |
| `FRONTEND_URL_PROD` | Yes | Production frontend base URL | Your deployed frontend URL |
| `MONGODB_URI` | Yes | MongoDB connection string | MongoDB local install or MongoDB Atlas connection string |
| `REDIS_USERNAME` | Yes | Redis username | Redis provider dashboard (or local Redis user) |
| `REDIS_PASSWORD` | Yes | Redis password | Redis provider dashboard |
| `REDIS_HOST` | Yes | Redis host | Redis provider dashboard or localhost |
| `REDIS_PORT` | Yes | Redis port | Redis provider dashboard or default `6379` |
| `SENDER_EMAIL` | Yes | Email sender address | Verified sender email in your email provider/Brevo |
| `BREVO_API_KEY` | Yes | Brevo API key for email delivery | Brevo SMTP/API settings |
| `JWT_KEY` | Yes | JWT signing secret (minimum 32 chars) | Generate securely (`openssl rand -hex 32`) |
| `TURNSTILE_SECRET_KEY` | Yes | Cloudflare Turnstile secret key for server-side challenge verification | Cloudflare dashboard > Turnstile widget settings |
| `PoW_SECRET` | Yes | Proof-of-Work secret (minimum 32 chars) | Generate securely (`openssl rand -hex 32`) |
| `PoW_DIFFICULTY` | Yes | Proof-of-Work difficulty (1 to 6) | Application setting (recommended `3` for dev) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud identifier | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret | Cloudinary dashboard |
| `EMAIL_LOGOUT_SIGNING_KEY` | Yes | Signed email logout token secret (minimum 32 chars) | Generate securely (`openssl rand -hex 48`) |

### 3.4 Client Environment File (`client/.env`)

Use `client/.env.example` as reference.

> Important: Any variable prefixed with `NEXT_PUBLIC_` is exposed to browser clients. Never place private secrets here.

| Variable | Required | Description | Where to get it |
|----------|----------|-------------|-----------------|
| `NEXT_PUBLIC_BACKEND_URL_DEV` | Yes | Dev API URL used by client in development | Local backend URL |
| `NEXT_PUBLIC_BACKEND_URL_PROD` | Yes | Prod API URL used by client in production | Deployed backend URL |
| `NEXT_PUBLIC_FRONTEND_URL_DEV` | Yes | Dev frontend URL | Local frontend URL |
| `NEXT_PUBLIC_FRONTEND_URL_PROD` | Yes | Prod frontend URL | Deployed frontend URL |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes | Cloudflare Turnstile site key used by browser challenge widget | Cloudflare dashboard > Turnstile widget settings |

### 3.5 Recommended Setup Steps

1. Copy `server/.env.example` into:
   - `server/.env.development`
   - `server/.env.production`
2. Copy `client/.env.example` into `client/.env`.
3. Create root `./.env` only if you use GeoLite auto-download.
4. Fill values with environment-specific credentials.
5. Never commit real credentials to Git.

### 3.6 Quick Copy Commands

Run these from the project root to create the environment files immediately.

Overwrite existing files:

```bash
cp server/.env.example server/.env.development
cp server/.env.example server/.env.production
cp client/.env.example client/.env
[ -f .env ] || printf "MAXMIND_LICENSE_KEY=\n" > .env
```

Do not overwrite existing files:

```bash
cp -n server/.env.example server/.env.development
cp -n server/.env.example server/.env.production
cp -n client/.env.example client/.env
[ -f .env ] || printf "MAXMIND_LICENSE_KEY=\n" > .env
```

Verify files:

```bash
ls -la server/.env.development server/.env.production client/.env .env
```

---

## 4. GeoLite2 Database Setup (Optional)

> **Note:** This step is optional but recommended for production. Without the database, the application will fall back to an API-based geolocation service.

### Option A: Manual Download

1. Sign up for a free account at [MaxMind](https://www.maxmind.com/en/geolite2/signup)
2. Download the GeoLite2 City database from the [MaxMind Downloads](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data?lang=en) page
3. Extract the archive
4. Place the `GeoLite2-City.mmdb` file in:
   ```
   server/src/constants/GeoLite2-City.mmdb
   ```

### Option B: Automated Download

1. Obtain your license key from your [MaxMind Account](https://www.maxmind.com/en/accounts/current/license-key)

2. Add it to root `./.env`:

   ```env
   MAXMIND_LICENSE_KEY=your_license_key_here
   ```

   Or set it in your shell:

   **Linux / macOS:**
   ```bash
   export MAXMIND_LICENSE_KEY=your_license_key_here
   ```

   **Windows (Command Prompt):**
   ```cmd
   set MAXMIND_LICENSE_KEY=your_license_key_here
   ```

   **Windows (PowerShell):**
   ```powershell
   $env:MAXMIND_LICENSE_KEY="your_license_key_here"
   ```

3. Run the update script:
   ```bash
   node ./scripts/update-geolite2.js
   ```

4. Verify the file exists at `server/src/constants/GeoLite2-City.mmdb`

---

## 5. Running the Application

### Start Required Services

Ensure MongoDB and Redis are running before starting the application.

### Start Development Server

From the root directory:

```bash
# Using pnpm
pnpm run dev
```

### Access the Application

| Service | URL |
|---------|-----|
| Client | http://localhost:3000 |
| Server | http://localhost:`PORT` (as defined in your `.env` file) |

---

## 6. Pre-Push Quality Gate (Lint + Format Check)

Trimium uses Husky to block pushes that fail quality checks.

### What runs before push

The pre-push hook at `.husky/pre-push` runs:

```bash
pnpm run check
```

The `check` script runs both:

```bash
pnpm run lint && pnpm run format:check
```

If either command fails, push is rejected locally.

### Verify hook setup

```bash
git config --get core.hooksPath
```

Expected output:

```text
.husky/_
```

### Useful local commands

```bash
# Run all pre-push checks manually
pnpm run check

# Lint only
pnpm run lint

# Check formatting only
pnpm run format:check

# Auto-format files
pnpm run format
```

### If hooks are missing

```bash
pnpm run prepare
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Server won't start | Check that all required environment variables are set correctly |
| MongoDB connection failed | Verify MongoDB is running and the connection string is correct |
| Redis connection failed | Verify Redis is running and the connection details are correct |
| GeoLite2 not working | Ensure the `.mmdb` file is in the correct location |
| Push blocked by pre-push hook | Run `pnpm run lint` and `pnpm run format:check`, fix issues, then push again |
| Husky hook not triggering | Run `pnpm run prepare` and verify `git config --get core.hooksPath` returns `.husky/_` |
| Invalid environment configuration | Run server in dev and check validation output from `server/src/config/checkEnv.ts` |
| Client cannot call backend | Verify `client/.env` API URLs and restart the client dev server |

> **Note:** The server follows a fail-fast principle and will not start if environment variables are missing or misconfigured.
