# Trimium — Full-Stack URL Shortener & Link Management Platform

## Project Overview

Bun monorepo with two packages: `client/` (Next.js 16) and `server/` (Express 5).
Live at **trimium.vercel.app**.

---

## Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| **Client** | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui |
| **Server** | Express 5, TypeScript 5, MongoDB + Mongoose, Redis (ioredis), BullMQ       |
| **Auth**   | JWT (cookie-based) with token versioning, Argon2 hashing                   |
| **Infra**  | Vercel (client deploy), VPS + PM2 (server deploy), GitHub Actions CI/CD    |
| **Runtime**| Bun (v1.1+)                                                                |

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
└── src/index.ts     App entry point

docs/                Architecture documentation
scripts/             Utility scripts (install, clean, reset, GeoIP updater)
```

---

## Key Architecture Patterns

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
| **Formatting**    | Prettier (tabWidth 4, singleQuote false, printWidth 100) |

---

## Commands

### Root

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `bun dev`             | Run client + server concurrently   |
| `bun run lint`        | ESLint check                       |
| `bun run lint:fix`    | Auto-fix ESLint issues             |
| `bun run format`      | Auto-format with Prettier          |
| `bun run format:check`| Prettier check                     |
| `bun run check`       | lint + format:check combined       |
| `bun run install:all` | Install all workspace dependencies |
| `bun run download:geoip` | Download GeoIP database            |

### Server (run from `server/`)

| Command      | Description                              |
| ------------ | ---------------------------------------- |
| `bun run build` | Bun build (TypeScript + bundle)         |
| `bun run dev`   | Dev watch mode with Bun                 |
| `bun run start` | Production start from `dist/`           |
| `bun run preview` | Build + start                          |

### Client (run from `client/`)

| Command      | Description               |
| ------------ | ------------------------- |
| `bun run build` | Next.js build to `.next/` |
| `bun run dev`   | Next.js dev server        |
| `bun run start` | Production start          |
| `bun run preview` | Build + start on port 3001 |

---

## Critical Rules

- NEVER make git commits, git pushes, or GitHub PR changes without explicit user permission or confirmation
- Always ask before committing, pushing, or creating/modifying pull requests
- When starting work on a NEW feature, always ASK the user whether to create a new branch (suggest a name like `feat/XYZ`) or continue working on the current branch — never assume
- Builds are STRICTLY verified before considering any change complete:
    - Client build: run `bun run build` from the `client/` directory
    - Server build: run `bun run build` from the `server/` directory
- Quality gates are STRICTLY enforced at the repository root:
    - Lint: run `bun run lint`
    - Prettier: run `bun run format:check`

## Important Notes

- Husky pre-push hook runs `bun run check` automatically
- Client build output: `client/.next/`
- Server build output: `server/dist/`
- Server env files (`.env.development`, `.env.production`) are gitignored; use `.env.example` as template
- Client env file (`.env`) are gitignored; use `.env.example` as template
- Lockfile: `bun.lock` (replaces pnpm-lock.yaml)
- Package manager: Bun (v1.1+)