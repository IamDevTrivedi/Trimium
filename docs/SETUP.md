# Trimium Setup Guide

A comprehensive guide to set up and run the Trimium application locally.

---

## Prerequisites

Ensure the following tools and services are installed before proceeding:

| Requirement        | Version | Notes                                |
| ------------------ | ------- | ------------------------------------ |
| Node.js            | v18+    | Required                             |
| pnpm               | Latest  | Required for workspace scripts       |
| Git                | Latest  | Required for Husky pre-push hooks    |
| MongoDB            | Latest  | Local or cloud (e.g., MongoDB Atlas) |
| Redis              | Latest  | Local or cloud (e.g., Redis Cloud)   |
| MaxMind GeoLite2   | Latest  | Optional, enhances location services |
| Brevo account      | Latest  | Required for transactional emails    |
| Cloudinary account | Latest  | Required for media uploads           |

---

## 1. Clone the Repository

```bash
git clone https://github.com/IamDevTrivedi/Trimium
cd Trimium
```

---

## 2. Install Dependencies

From the project root, run:

```bash
pnpm run install:all
```

> This installs dependencies for the root, client, and server workspaces. The root `prepare` script also initializes Husky hooks automatically.

---

## 3. Environment Configuration

Trimium uses environment files in multiple locations. Each is loaded based on the running context.

### 3.1 Environment Files Quick Map

| File Name          | Location                  | Purpose                           | Required   |
| ------------------ | ------------------------- | --------------------------------- | ---------- |
| `.env`             | Project root (`./.env`)   | Root scripts (MaxMind downloader) | Optional   |
| `.env.development` | `server/.env.development` | Backend development config        | Yes (dev)  |
| `.env.production`  | `server/.env.production`  | Backend production config         | Yes (prod) |
| `.env`             | `client/.env`             | Frontend public config            | Yes        |

> All environment files are gitignored (`.env`, `.env.*`). They will never be committed.

### 3.2 Root Environment (`./.env`)

Used by `scripts/update-geolite2.js` to download the GeoIP database.

| Variable              | Required | Description                                                                                                                                              |
| --------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MAXMIND_LICENSE_KEY` | Optional | License key to download `GeoLite2-City.mmdb` automatically. Obtain from [MaxMind license page](https://www.maxmind.com/en/accounts/current/license-key). |

### 3.3 Server Environment (`server/.env.development`, `server/.env.production`)

The server loads the appropriate file based on `NODE_ENV` (see `server/src/config/env.ts`). Validation is enforced at startup via `server/src/config/checkEnv.ts` — the server will fail fast if values are missing or invalid.

Create both files using `server/.env.example`, then set environment-specific values.

| Variable                   | Required | Description                                                                          |
| -------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `PORT`                     | Yes      | API server port (e.g., `5000`)                                                       |
| `BACKEND_URL_DEV`          | Yes      | Development backend URL (e.g., `http://localhost:5000`)                              |
| `BACKEND_URL_PROD`         | Yes      | Production backend URL (your deployed domain)                                        |
| `FRONTEND_URL_DEV`         | Yes      | Development frontend URL (e.g., `http://localhost:3000`)                             |
| `FRONTEND_URL_PROD`        | Yes      | Production frontend URL (your deployed domain)                                       |
| `MONGODB_URI`              | Yes      | MongoDB connection string                                                            |
| `REDIS_USERNAME`           | Yes      | Redis username                                                                       |
| `REDIS_PASSWORD`           | Yes      | Redis password                                                                       |
| `REDIS_HOST`               | Yes      | Redis host                                                                           |
| `REDIS_PORT`               | Yes      | Redis port (default `6379`)                                                          |
| `SENDER_EMAIL`             | Yes      | Verified sender email in Brevo                                                       |
| `BREVO_API_KEY`            | Yes      | Brevo API key for transactional emails                                               |
| `JWT_KEY`                  | Yes      | JWT signing secret (min 32 chars). Generate via `openssl rand -hex 32`               |
| `TURNSTILE_SECRET_KEY`     | Yes      | Cloudflare Turnstile secret key                                                      |
| `PoW_SECRET`               | Yes      | Proof-of-Work secret (min 32 chars). Generate via `openssl rand -hex 32`             |
| `PoW_DIFFICULTY`           | Yes      | Proof-of-Work difficulty (1–6). Recommended `3` for development                      |
| `CLOUDINARY_CLOUD_NAME`    | Yes      | Cloudinary cloud identifier                                                          |
| `CLOUDINARY_API_KEY`       | Yes      | Cloudinary API key                                                                   |
| `CLOUDINARY_API_SECRET`    | Yes      | Cloudinary API secret                                                                |
| `EMAIL_LOGOUT_SIGNING_KEY` | Yes      | Signed email logout token secret (min 32 chars). Generate via `openssl rand -hex 48` |

> [!IMPORTANT]
> Generate unique, strong secrets for `JWT_KEY`, `PoW_SECRET`, and `EMAIL_LOGOUT_SIGNING_KEY`. Never reuse secrets across environments.

### 3.4 Client Environment (`client/.env`)

Use `client/.env.example` as reference.

> [!CAUTION]
> Variables prefixed with `NEXT_PUBLIC_` are exposed to browser clients. Never place private secrets here.

| Variable                         | Required | Description                      |
| -------------------------------- | -------- | -------------------------------- |
| `NEXT_PUBLIC_BACKEND_URL_DEV`    | Yes      | Backend URL used in development  |
| `NEXT_PUBLIC_BACKEND_URL_PROD`   | Yes      | Backend URL used in production   |
| `NEXT_PUBLIC_FRONTEND_URL_DEV`   | Yes      | Frontend URL used in development |
| `NEXT_PUBLIC_FRONTEND_URL_PROD`  | Yes      | Frontend URL used in production  |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes      | Cloudflare Turnstile site key    |

### 3.5 Recommended Setup Steps

1. Copy `server/.env.example` to both `server/.env.development` and `server/.env.production`
2. Copy `client/.env.example` to `client/.env`
3. Create root `./.env` only if using GeoLite2 auto-download
4. Fill all values with your environment-specific credentials
5. Never commit real credentials to Git

### 3.6 Quick Copy Commands

Run from the project root. The first set overwrites existing files; the second preserves them.

**Overwrite existing files:**

```bash
cp server/.env.example server/.env.development
cp server/.env.example server/.env.production
cp client/.env.example client/.env
[ -f .env ] || printf "MAXMIND_LICENSE_KEY=\n" > .env
```

**Preserve existing files:**

```bash
cp -n server/.env.example server/.env.development
cp -n server/.env.example server/.env.production
cp -n client/.env.example client/.env
[ -f .env ] || printf "MAXMIND_LICENSE_KEY=\n" > .env
```

**Verify the files exist:**

```bash
ls -la server/.env.development server/.env.production client/.env .env
```

---

## 4. GeoLite2 Database Setup (Optional)

> [!NOTE]
> This step is optional but recommended for production. Without the database, the application falls back to an API-based geolocation service with reduced throughput.

### Option A: Manual Download

1. Sign up for a free account at [MaxMind](https://www.maxmind.com/en/geolite2/signup)
2. Download the GeoLite2 City database from the [MaxMind Downloads](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) page
3. Extract the archive and place `GeoLite2-City.mmdb` at:
    ```
    server/src/constants/GeoLite2-City.mmdb
    ```

### Option B: Automated Download

1. Obtain your license key from your [MaxMind Account](https://www.maxmind.com/en/accounts/current/license-key)

2. Add it to root `./.env`:

    ```env
    MAXMIND_LICENSE_KEY=your_license_key_here
    ```

    Or set it via environment variable:

    ```bash
    # Linux / macOS
    export MAXMIND_LICENSE_KEY=your_license_key_here

    # Windows (Command Prompt)
    set MAXMIND_LICENSE_KEY=your_license_key_here

    # Windows (PowerShell)
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

Ensure MongoDB and Redis are running before starting the application — either locally or through a cloud provider.

### Start Development Server

From the project root:

```bash
pnpm run dev
```

This starts both the client and server concurrently.

### Access the Application

| Service | URL                                                               |
| ------- | ----------------------------------------------------------------- |
| Client  | http://localhost:3000                                             |
| Server  | http://localhost:`PORT` (as defined in `server/.env.development`) |

---

## 6. Pre-Push Quality Gate

Trimium uses **Husky** to enforce quality checks before every push.

### What runs before push

The pre-push hook at `.husky/pre-push` executes:

```bash
pnpm run check
```

The `check` script runs linting and formatting verification:

```bash
pnpm run lint && pnpm run format:check
```

If either command fails, the push is rejected locally.

### Verify hook setup

```bash
git config --get core.hooksPath
```

Expected output:

```
.husky/_
```

### Useful local commands

```bash
pnpm run check        # Run all pre-push checks manually
pnpm run lint         # Lint only
pnpm run format:check # Check formatting only
pnpm run format       # Auto-format files
```

### If hooks are missing

```bash
pnpm run prepare
```

---

## Troubleshooting

| Issue                             | Solution                                                              |
| --------------------------------- | --------------------------------------------------------------------- |
| Server won't start                | Verify all required environment variables are set correctly           |
| MongoDB connection failed         | Confirm MongoDB is running and the connection string is correct       |
| Redis connection failed           | Confirm Redis is running and the connection details are accurate      |
| GeoLite2 not working              | Ensure the `.mmdb` file is placed in `server/src/constants/`          |
| Push blocked by pre-push hook     | Run `pnpm run check`, fix issues, then push again                     |
| Husky hook not triggering         | Run `pnpm run prepare` and verify `core.hooksPath` returns `.husky/_` |
| Invalid environment configuration | Start the server in dev mode and check the Zod validation output      |
| Client cannot reach backend       | Verify `client/.env` API URLs and restart the client dev server       |

> [!NOTE]
> The server follows a **fail-fast** principle — it will not start if environment variables are missing or misconfigured. Validation details are printed to the console.
