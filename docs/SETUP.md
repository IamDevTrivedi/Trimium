# Trimium Setup Guide

A comprehensive guide to set up and run the Trimium application locally.

---

## Prerequisites

Ensure the following tools and services are installed before proceeding:

| Requirement        | Version | Notes                                                                              |
| ------------------ | ------- | ---------------------------------------------------------------------------------- |
| Bun                | 1.4.0+  | [Installation guide](https://bun.sh)                                                |
| Git                | Latest  | Required for Husky pre-commit hooks                                                |
| Docker             | Latest  | Required to run MongoDB, Redis, and Mailpit via `server/docker-compose.yml`          |
| Cloudinary account | Latest  | Required for media uploads                                                         |
| SMTP Email Account | Latest  | Required for transactional emails (local dev uses Mailpit, see below)               |
| MaxMind GeoLite2   | Latest  | Optional, enhances location services                                                |

> [!NOTE]
> MongoDB, Redis, and Mailpit (local SMTP catch-all) are provided by `server/docker-compose.yml`. Docker is the only additional infrastructure requirement — no separate MongoDB or Redis installs needed for local development.

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
bun run install:all
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

> [!NOTE]
> For local development, `server/.env.example` is pre-configured to match the services defined in `server/docker-compose.yml` (MongoDB, Redis, Mailpit). Copy it directly without editing.

### 3.3 Server Environment (`server/.env.development`, `server/.env.production`)

The server loads the appropriate file based on `NODE_ENV` (set by Bun when using `--env-file`). Validation is enforced at startup via `server/src/config/checkEnv.ts` — the server will fail fast if values are missing or invalid.

Create both files using `server/.env.example`, then set environment-specific values.

| Variable                    | Required | Description                                                                          |
| -------------------------- | -------- | ------------------------------------------------------------------------------------ |
| `NODE_ENV`                 | Yes      | `development` or `production`                                                        |
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
| `SMTP_HOST`                | Yes      | SMTP server host (e.g., `smtp.gmail.com`, `smtp.resend.dev`)                        |
| `SMTP_PORT`                | Yes      | SMTP server port (e.g., `587` for TLS, `465` for SSL)                               |
| `SMTP_USER`                | Yes      | SMTP username / email address                                                       |
| `SMTP_PASS`                | Yes      | SMTP password or app-specific password                                               |
| `SENDER_EMAIL`             | Yes      | Verified sender email                                                                |
| `JWT_KEY`                  | Yes      | JWT signing secret (min 32 chars). Generate via `openssl rand -hex 32`                |
| `TURNSTILE_SECRET_KEY`     | Yes      | Cloudflare Turnstile secret key                                                      |
| `PoW_SECRET`               | Yes      | Proof-of-Work secret (min 32 chars). Generate via `openssl rand -hex 32`              |
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
    bun run download:geoip
    ```

4. Verify the file exists at `server/src/constants/GeoLite2-City.mmdb`

---

## 5. Running the Application

### Start Required Services (Local Dev)

The `server/docker-compose.yml` file ships MongoDB, Redis, Mailpit (local SMTP catch-all), and their UIs. Start it before launching the app:

```bash
cd server
docker compose up -d
```

This brings up:

| Container          | Host port | Purpose                          |
| ------------------ | --------- | -------------------------------- |
| `mongodb-server`   | `5002`    | MongoDB (root / root)            |
| `redis-server`     | `5001`    | Redis (`default` / `password`)   |
| `mailpit-server`   | `5003`    | SMTP (no auth) + UI on `5004`    |
| `mongodb-viewer`   | `5006`    | Mongo Express UI (admin / admin) |
| `redis-insights`   | `5005`    | Redis Insight UI                 |

> [!TIP]
> Mailpit captures every email the app sends. Open http://localhost:5004 in your browser to inspect them — no real emails are sent during local dev.

> [!IMPORTANT]
> The default MongoDB image in `server/docker-compose.yml` is pinned to a version that is compatible with the host Linux kernel. If you fork this project on a newer kernel, you may need to update the image tag.

To stop the stack:

```bash
cd server
docker compose down
```

### Start Development Server

From the project root:

```bash
bun run dev
```

This starts both the client and server concurrently using Bun's parallel execution.

### Access the Application

| Service      | URL                                                                       |
| ------------ | ------------------------------------------------------------------------- |
| Client       | http://localhost:3000                                                     |
| Server       | http://localhost:`PORT` (as defined in `server/.env.development`)         |
| Mailpit UI   | http://localhost:5004                                                     |
| Mongo Express | http://localhost:5006                                                    |
| Redis Insight | http://localhost:5005                                                    |

---

## 6. Pre-Commit Quality Gate

Trimium uses **Husky** to enforce quality checks before every commit.

### What runs before commit

The pre-commit hook at `.husky/pre-commit` executes:

```bash
bun run check
```

The `check` script runs Biome linting and formatting verification:

```bash
bun run lint:check && bun run format:check
```

If either command fails, the commit is rejected locally.

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
bun run check        # Run all pre-commit checks manually
bun run lint:check   # Lint only (Biome)
bun run format:check # Check formatting only (Biome)
bun run format       # Auto-format files
```

### If hooks are missing

```bash
bun run prepare
```

---

## Troubleshooting

| Issue                             | Solution                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------ |
| Server won't start                | Verify all required environment variables are set correctly                                |
| MongoDB connection failed         | Confirm the dev stack is running: `cd server && docker compose ps`                         |
| Redis connection failed           | Confirm the dev stack is running: `cd server && docker compose ps`                         |
| MongoDB container keeps restarting | Check host kernel compatibility — see `server/docker-compose.yml` for the pinned image tag |
| Email not arriving                | Open http://localhost:5004 (Mailpit) — local dev never sends real email                    |
| GeoLite2 not working             | Ensure the `.mmdb` file is placed in `server/src/constants/`                               |
| Commit blocked by pre-commit hook | Run `bun run check`, fix issues, then commit again                                         |
| Husky hook not triggering        | Run `bun run prepare` and verify `core.hooksPath` returns `.husky/_`                       |
| Invalid environment configuration | Start the server in dev mode and check the Zod validation output                           |
| Client cannot reach backend       | Verify `client/.env` API URLs and restart the client dev server                            |

> [!NOTE]
> The server follows a **fail-fast** principle — it will not start if environment variables are missing or misconfigured. Validation details are printed to the console.
