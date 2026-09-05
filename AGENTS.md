# Trimium — Full-Stack URL Shortener & Link Management Platform

## Project Overview

Bun monorepo with two packages: `client/` (Next.js 16) and `server/` (Express 5).
Live at **trimium.vercel.app**.

---

## Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| **Client** | Next.js 16 (App Router), React 19, TypeScript 7, Tailwind CSS 4, shadcn/ui |
| **Server** | Express 5, TypeScript 7, MongoDB + Mongoose, Redis (native), BullMQ       |
| **Auth**   | JWT (cookie-based) with token versioning, Argon2 hashing                   |
| **Infra**  | Vercel (client deploy), VPS + Docker + GHCR (server deploy), GitHub Actions CI/CD |
| **Package Manager** | Bun 1.4.0                                                     |
| **Linting & Formatting** | Biome                            |

---

## Monorepo Structure

```
client/              Next.js 16 frontend
├── src/app/         App Router pages (route groups: auth, accounts, workspaces, tools)
├── src/components/  Shared React components (ui/ subdir for shadcn primitives)
├── src/store/       Zustand state stores
├── src/lib/         Utility functions (cn(), date helpers)
├── src/config/      Client config (backend API URL, env vars)
├── src/hooks/       Custom React hooks
└── src/constants/   Client constants (regex, tags, linkhub themes)

server/              Express 5 backend
├── src/modules/     Feature modules (auth, url, workspace, user, health, contact, linkhub)
│   └── each has:    routes.ts + controllers.ts
├── src/models/      Mongoose models (url, user, workspace, analytics, loginHistory, etc.)
├── src/middlewares/  Express middlewares (protectRoute, rateLimiter, IP, UAParser, etc.)
├── src/config/      Server config (env, argon2, cloudinary, mailer, swagger)
├── src/utils/       Utility functions (sendResponse, hash, generateShortCode, etc.)
├── src/constants/   Server constants (app, regex, tags, GeoIP database)
├── src/db/          Database connections (connectMongo, connectRedis)
├── Dockerfile       Multi-stage Bun image (builder + runner) for production
├── .dockerignore    Files excluded from the Docker build context
├── entrypoint.sh    Container entrypoint: downloads GeoIP then execs Bun
├── geolite2.js      On-startup GeoIP database downloader
├── docker-compose.yml       Production stack (app + redis)
└── docker-compose.dev.yml   Local dev services (MongoDB, Redis, Mailpit)

docs/                Architecture documentation
scripts/             Utility scripts (install, clean, reset)
```

---

## Key Architecture Patterns

### Server Runs Inside a Docker Image

The production server runs inside a multi-stage Docker image built from `server/Dockerfile` and pushed to GHCR as `ghcr.io/iamdevtrivedi/trimium-app:latest`. The CI workflow tags `:latest` → `:current` and, after a successful health check, promotes `:current` → `:live`. The VPS runs `docker compose up -d` against the production `server/docker-compose.yml`, which deploys the `:current` tag.

For local development, run the server directly via Bun:

```bash
bun --env-file=.env.development run src/index.ts
```

### API Response Format

All API responses use `sendResponse()` from `server/src/utils/sendResponse.ts`:

```ts
sendResponse(res, {
    success: boolean,
    statusCode: StatusCodes,
    message: string,
    ...other,
});
```

### Validation

Zod schemas defined inline at the top of each controller function.
Use `z.treeifyError(result.error)` for error formatting.

### Authentication

- JWT in `authToken` cookie, verified by `protectRoute` middleware
- Token versioning stored on User + LoginHistory for session invalidation
- Redis-first reads for performance

### Rate Limiting

Redis-backed with adaptive Proof-of-Work (SHA-256 hashcash).
Client-side Axios interceptor auto-solves PoW challenges.

### Background Jobs

BullMQ queues (email + activity updates), processed by workers.

### Import Aliases (server)

| Alias           | Path                      |
| --------------- | ------------------------- |
| `@/`            | `server/src/`             |
| `@config/`      | `server/src/config/`      |
| `@utils/`       | `server/src/utils/`       |
| `@middlewares/` | `server/src/middlewares/` |
| `@modules/`     | `server/src/modules/`     |
| `@db/`          | `server/src/db/`          |

---

## Conventions

| Rule              | Detail                                                   |
| ----------------- | -------------------------------------------------------- |
| **TypeScript**    | Strict mode everywhere                                   |
| **Controllers**   | Exported as `controllers` object                         |
| **Routes**        | Exported as `router`                                     |
| **Models**        | One file per model in `server/src/models/`               |
| **UI components** | shadcn/ui in `client/src/components/ui/`                 |
| **Styling**       | Tailwind + `cn()` from `client/src/lib/utils.ts`         |
| **Formatting**    | Biome (tabWidth 4, doubleQuote true, semicolons always, printWidth 100) |

---

## Commands

### Root

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `bun run dev`         | Run client + server concurrently   |
| `bun run lint:check`  | Biome lint check                  |
| `bun run lint`        | Biome lint auto-fix               |
| `bun run format:check` | Biome format check                |
| `bun run format`      | Biome format auto-fix             |
| `bun run check`       | lint:check + format:check         |
| `bun run install:all` | Install all workspace dependencies |
| `bun run download:geoip` | Download GeoIP database           |
| `bun run clean:all`   | Clean node_modules and build dirs |
| `bun run reset:all`   | clean:all + install:all           |

### Server (run from `server/`)

| Command      | Description                                              |
| ------------ | --------------------------------------------------------- |
| `bun run dev`   | Bun dev mode with --env-file (watches for changes)      |
| `bun run start` | Bun production start with --env-file                     |
| `bun run typecheck` | TypeScript type checking (`tsc --noEmit`)            |

> **Note:** Production server runs inside a Docker container built from `server/Dockerfile` — see "Server Runs Inside a Docker Image" above.

### Client (run from `client/`)

| Command      | Description               |
| ------------ | ------------------------- |
| `bun run build`   | Next.js build to `.next/` |
| `bun run dev`     | Next.js dev server        |
| `bun run start`   | Production start          |
| `bun run preview` | Build + serve on port 3001 |

---

## Critical Rules

- **Server has a Dockerfile** — production builds a multi-stage Docker image pushed to GHCR. Do not assume a `dist/` output is used.
- NEVER manually edit or update `docs/DIRECTORY_STRUCTURE.md` — it is auto-generated and kept in sync by the `.github/workflows/update-directory-structure.yml` workflow (scheduled daily at 06:00 UTC).
- NEVER make git commits, git pushes, or GitHub PR changes without explicit user permission or confirmation.
- Always ask before committing, pushing, or creating/modifying pull requests.
- When starting work on a NEW feature, always ASK the user whether to create a new branch (suggest a name like `feat/XYZ`) or continue working on the current branch — never assume.
- Quality gates are STRICTLY enforced at the repository root via Husky pre-commit hook:
    - Lint: `bun run lint:check`
    - Format: `bun run format:check`
    - Both run together: `bun run check`

## Important Notes

- Husky pre-commit hook runs `bun run check` automatically.
- Client build output: `client/.next/`
- Server production image: `ghcr.io/iamdevtrivedi/trimium-app` (`:current` = deployed, `:live` = last-known-good)
- Server env files (`.env.development`, `.env.production`) are gitignored; use `.env.example` as template.
- Client env file (`.env`) is gitignored; use `.env.example` as template.
- The project uses **Biome** for both linting and formatting.
- Linting is disabled for `client/**`
