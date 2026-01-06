# Directory Structure

```
.
├── LICENSE
├── README.md
├── client
│   ├── components.json
│   ├── next-env.d.ts
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public
│   │   ├── brand.png
│   │   ├── favicon.png
│   │   ├── og-about.png
│   │   ├── og-features.png
│   │   ├── og-home.png
│   │   └── og-qr-generator.png
│   ├── resources
│   │   ├── about.mdx
│   │   ├── privacy.mdx
│   │   └── terms.mdx
│   ├── src
│   │   ├── app
│   │   │   ├── (accounts)
│   │   │   │   ├── account
│   │   │   │   │   ├── login-activity
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (auth)
│   │   │   │   ├── create-account
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── set-password
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── set-profile
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── verify
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── login
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── logout
│   │   │   │   │   └── page.tsx
│   │   │   │   └── reset-password
│   │   │   │       ├── page.tsx
│   │   │   │       ├── set-password
│   │   │   │       │   └── page.tsx
│   │   │   │       └── verify
│   │   │   │           └── page.tsx
│   │   │   ├── (legal)
│   │   │   │   ├── about
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── contact-us
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── privacy-policy
│   │   │   │   │   └── page.tsx
│   │   │   │   └── terms-of-service
│   │   │   │       └── page.tsx
│   │   │   ├── (redirecting)
│   │   │   │   └── r
│   │   │   │       └── [shortCode]
│   │   │   │           ├── layout.tsx
│   │   │   │           └── page.tsx
│   │   │   ├── (tools)
│   │   │   │   └── qr-generator
│   │   │   │       ├── layout.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── (workspaces)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── w
│   │   │   │       ├── [workspaceID]
│   │   │   │       │   ├── [shortCode]
│   │   │   │       │   │   ├── edit
│   │   │   │       │   │   │   └── page.tsx
│   │   │   │       │   │   └── page.tsx
│   │   │   │       │   ├── bulk-upload
│   │   │   │       │   │   └── page.tsx
│   │   │   │       │   ├── create-url
│   │   │   │       │   │   └── page.tsx
│   │   │   │       │   ├── layout.tsx
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── new
│   │   │   │       │   └── page.tsx
│   │   │   │       └── page.tsx
│   │   │   ├── favicon.ico
│   │   │   ├── features
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── components
│   │   │   ├── account-page.tsx
│   │   │   ├── bulk-upload-urls.tsx
│   │   │   ├── card-footer.tsx
│   │   │   ├── contact-form.tsx
│   │   │   ├── create-account-forms.tsx
│   │   │   ├── create-redirect-form.tsx
│   │   │   ├── create-workspace-dialog.tsx
│   │   │   ├── create-workspace-form.tsx
│   │   │   ├── custom-qr-generator.tsx
│   │   │   ├── edit-redirect-form.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── login-forms.tsx
│   │   │   ├── login-history.tsx
│   │   │   ├── markdown-content.tsx
│   │   │   ├── mode-toggle.tsx
│   │   │   ├── navbar.tsx
│   │   │   ├── pending-invitations.tsx
│   │   │   ├── protect-page.tsx
│   │   │   ├── protect-workspace.tsx
│   │   │   ├── qr-code-generator.tsx
│   │   │   ├── reset-password-forms.tsx
│   │   │   ├── shortcode-performance.tsx
│   │   │   ├── shortcode-tags.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── top-back-button.tsx
│   │   │   ├── ui
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── aspect-ratio.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   ├── button-group.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── carousel.tsx
│   │   │   │   ├── chart.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── collapsible.tsx
│   │   │   │   ├── combobox.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── context-menu.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── drawer.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── empty.tsx
│   │   │   │   ├── field.tsx
│   │   │   │   ├── floating-navbar.tsx
│   │   │   │   ├── hover-card.tsx
│   │   │   │   ├── input-group.tsx
│   │   │   │   ├── input-otp.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── item.tsx
│   │   │   │   ├── kbd.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── menubar.tsx
│   │   │   │   ├── navigation-menu.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   ├── spinner.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toggle-group.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   └── tooltip.tsx
│   │   │   ├── workspace-details.tsx
│   │   │   ├── workspace-list.tsx
│   │   │   ├── workspace-page-tabs.tsx
│   │   │   ├── workspace-performance.tsx
│   │   │   └── workspace-tags.tsx
│   │   ├── config
│   │   │   ├── backend.ts
│   │   │   └── env.ts
│   │   ├── constants
│   │   │   ├── regex.ts
│   │   │   └── tags.ts
│   │   ├── hooks
│   │   │   └── use-mobile.tsx
│   │   ├── lib
│   │   │   ├── date.ts
│   │   │   ├── handle-response.ts
│   │   │   ├── readFileContent.ts
│   │   │   ├── tags-getter.ts
│   │   │   ├── toast-error.tsx
│   │   │   └── utils.ts
│   │   └── store
│   │       ├── create-account-store.ts
│   │       ├── create-url-store.ts
│   │       ├── login-store.ts
│   │       ├── reset-password-store.ts
│   │       └── user-store.ts
│   └── tsconfig.json
├── docs
│   ├── DIRECTORY_STRUCTURE.md
│   └── SETUP.md
├── eslint.config.ts
├── package.json
├── public
│   └── preview.png
├── scripts
│   ├── clean-all.js
│   ├── install-all.js
│   ├── reset-all.js
│   └── update-geolite2.js
├── server
│   ├── logs
│   │   ├── app-development.log
│   │   ├── app-production.log
│   │   ├── error-development.log
│   │   ├── error-production.log
│   │   ├── pm2-error.log
│   │   └── pm2-out.log
│   ├── package.json
│   ├── src
│   │   ├── config
│   │   │   ├── checkEnv.ts
│   │   │   ├── env.ts
│   │   │   └── mailer.ts
│   │   ├── constants
│   │   │   ├── GeoLite2-City.mmdb
│   │   │   ├── GeoLite2-City.mmdb.backup
│   │   │   ├── regex.ts
│   │   │   └── tags.ts
│   │   ├── db
│   │   │   ├── connectMongo.ts
│   │   │   └── connectRedis.ts
│   │   ├── index.ts
│   │   ├── middlewares
│   │   │   ├── IP.ts
│   │   │   ├── UAParser.ts
│   │   │   ├── httpLogger.ts
│   │   │   ├── location.ts
│   │   │   ├── protectRoute.ts
│   │   │   └── rateLimiter.ts
│   │   ├── models
│   │   │   ├── analytics.ts
│   │   │   ├── contactFormSubmissions.ts
│   │   │   ├── invitation.ts
│   │   │   ├── loginHistory.ts
│   │   │   ├── url.ts
│   │   │   ├── user.ts
│   │   │   └── workspace.ts
│   │   ├── modules
│   │   │   ├── auth
│   │   │   │   ├── controllers.ts
│   │   │   │   └── routes.ts
│   │   │   ├── contact
│   │   │   │   ├── controller.ts
│   │   │   │   └── routes.ts
│   │   │   ├── health
│   │   │   │   ├── controllers.ts
│   │   │   │   └── routes.ts
│   │   │   ├── queue
│   │   │   │   ├── index.ts
│   │   │   │   ├── processors
│   │   │   │   │   └── sendEmail.ts
│   │   │   │   ├── queues.ts
│   │   │   │   ├── redisConfig.ts
│   │   │   │   └── workers.ts
│   │   │   ├── root
│   │   │   │   ├── controllers.ts
│   │   │   │   └── routes.ts
│   │   │   ├── url
│   │   │   │   ├── controllers.ts
│   │   │   │   └── routes.ts
│   │   │   ├── user
│   │   │   │   ├── controllers.ts
│   │   │   │   └── routes.ts
│   │   │   └── workspace
│   │   │       ├── controllers.ts
│   │   │       └── routes.ts
│   │   └── utils
│   │       ├── date.ts
│   │       ├── emailTemplates.ts
│   │       ├── generateOTP.ts
│   │       ├── generateShortCode.ts
│   │       ├── getWorkspacePerformance.ts
│   │       ├── logger.ts
│   │       ├── normalizeEmail.ts
│   │       ├── sendResponse.ts
│   │       ├── sha256.ts
│   │       └── tags.ts
│   └── tsconfig.json
└── tests
    ├── Dockerfile
    └── docker-compose.yml

68 directories, 226 files
```

## Overview

This document outlines the directory structure of the Trimium project, a full-stack URL shortener application built with Next.js (client) and Node.js/Express (server).

## Root Level

- **docs/**: Project documentation
- **client/**: Frontend Next.js application
- **server/**: Backend Node.js/Express API
- **scripts/**: Utility scripts for project management

## Client Structure

### App Directory (`client/src/app`)

The client uses Next.js 13+ App Router with route groups:

- **(accounts)**: User account management pages
- **(auth)**: Authentication flows (login, signup, password reset)
- **(legal)**: Legal pages (privacy policy, terms of service, about)
- **(redirecting)**: Short URL redirect handler
- **(tools)**: Utility tools like QR code generator
- **(workspaces)**: Main workspace and URL management interface

### Components (`client/src/components`)

Reusable React components including:
- Form components for authentication and URL creation
- UI components library (shadcn/ui based)
- Custom components for workspace and analytics display

### Configuration & State

- **config/**: Backend API and environment configuration
- **constants/**: Shared constants like regex patterns and tags
- **hooks/**: Custom React hooks
- **lib/**: Utility functions and helpers
- **store/**: Zustand state management stores

## Server Structure

### Core (`server/src`)

- **config/**: Environment variables and email configuration
- **db/**: Database connection handlers (MongoDB, Redis)
- **middlewares/**: Express middlewares for authentication, rate limiting, logging
- **models/**: MongoDB/Mongoose data models
- **modules/**: Feature-based module organization with controllers and routes
- **utils/**: Server-side utility functions

### Modules

Each module contains its own controllers and routes:
- **auth**: User authentication
- **contact**: Contact form submissions
- **health**: Health check endpoints
- **url**: URL shortening and management
- **user**: User profile management
- **workspace**: Workspace operations and team collaboration
