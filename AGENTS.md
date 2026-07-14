# Trimium — Full-Stack URL Shortener & Link Management Platform

## Project Overview

pnpm monorepo with two packages: `client/` (Next.js 16) and `server/` (Express 5).
Live at **trimium.vercel.app**.

---

## Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| **Client** | Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS 4, shadcn/ui |
| **Server** | Express 5, TypeScript 5, MongoDB + Mongoose, Redis (ioredis), BullMQ       |
| **Auth**   | JWT (cookie-based) with token versioning, Argon2 hashing                   |
| **Infra**  | Vercel (client deploy), VPS + PM2 (server deploy), GitHub Actions CI/CD    |

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
| `pnpm dev`            | Run client + server concurrently   |
| `pnpm lint`           | ESLint check                       |
| `pnpm lint:fix`       | Auto-fix ESLint issues             |
| `pnpm format`         | Auto-format with Prettier          |
| `pnpm format:check`   | Prettier check                     |
| `pnpm check`          | lint + format:check combined       |
| `pnpm install:all`    | Install all workspace dependencies |
| `pnpm download:geoip` | Download GeoIP database            |

### Server (run from `server/`)

| Command      | Description                                           |
| ------------ | ----------------------------------------------------- |
| `pnpm build` | TypeScript compile + `tsc-alias` (type check + build) |
| `pnpm dev`   | Dev watch mode with `tsx`                             |
| `pnpm start` | Production start from `dist/`                         |

### Client (run from `client/`)

| Command      | Description               |
| ------------ | ------------------------- |
| `pnpm build` | Next.js build to `.next/` |
| `pnpm dev`   | Next.js dev server        |
| `pnpm start` | Production start          |

---

## Critical Rules

- NEVER make git commits, git pushes, or GitHub PR changes without explicit user permission or confirmation
- Always ask before committing, pushing, or creating/modifying pull requests

## Important Notes

- Husky pre-push hook runs `pnpm check` automatically
- Client build output: `client/.next/`
- Server build output: `server/dist/`
- Server env files (`.env.development`, `.env.production`) are gitignored; use `.env.example` as template
- Client env file (`.env`) are gitignored; use `.env.example` as template
