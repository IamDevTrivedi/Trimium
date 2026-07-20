# Directory Structure

```
.
├── AGENTS.md
├── LICENSE
├── README.md
├── client
│   ├── components.json
│   ├── next.config.ts
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── postcss.config.mjs
│   ├── public
│   │   ├── brand.png
│   │   ├── favicon.png
│   │   ├── offline.html
│   │   ├── og-about.png
│   │   ├── og-features.png
│   │   ├── og-home.png
│   │   ├── og-qr-generator.png
│   │   └── sw.js
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
│   │   │   │   ├── email-logout
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
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
│   │   │   │   │   ├── about-content.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── contact-us
│   │   │   │   │   ├── contact-page-client.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── legal-content.tsx
│   │   │   │   ├── privacy-policy
│   │   │   │   │   └── page.tsx
│   │   │   │   └── terms-of-service
│   │   │   │       └── page.tsx
│   │   │   ├── (linkhub)
│   │   │   │   ├── linkhub-editor
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── t
│   │   │   │       └── [username]
│   │   │   │           └── page.tsx
│   │   │   ├── (redirecting)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── r
│   │   │   │       └── [shortCode]
│   │   │   │           └── page.tsx
│   │   │   ├── (tools)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── qr-generator
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
│   │   │   │   ├── features-page-client.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── home-page-client.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── not-found-client.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── components
│   │   │   ├── account-page.tsx
│   │   │   ├── auth-turnstile.tsx
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
│   │   │   ├── linkhub-editor.tsx
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
│   │   │   ├── service-worker-register.tsx
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
│   │   │   ├── linkhub-themes.ts
│   │   │   ├── regex.ts
│   │   │   ├── socials.tsx
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
│   ├── SETUP.md
│   ├── architecture
│   │   ├── AUTHENTICATION_AND_SESSION_MANAGEMENT_ARCHITECTURE.md
│   │   ├── CI_CD_PIPELINE_ARCHITECTURE.md
│   │   └── RATE_LIMITER_ARCHITECTURE.md
│   └── diagrams
│       ├── trimium-architecture-dark.png
│       └── trimium-architecture.png
├── eslint.config.ts
├── opencode.json
├── package.json
├── pnpm-lock.yaml
├── scripts
│   ├── clean-all.js
│   ├── generate-architecture.py
│   ├── install-all.js
│   ├── reset-all.js
│   └── update-geolite2.js
├── server
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── src
│   │   ├── config
│   │   │   ├── argon2.ts
│   │   │   ├── checkEnv.ts
│   │   │   ├── cloudinary.ts
│   │   │   ├── env.ts
│   │   │   ├── mailer.ts
│   │   │   └── swagger.ts
│   │   ├── constants
│   │   │   ├── app.ts
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
│   │   │   ├── rateLimiter.ts
│   │   │   ├── upload.ts
│   │   │   └── verifyTurnstile.ts
│   │   ├── models
│   │   │   ├── analytics.ts
│   │   │   ├── contactFormSubmissions.ts
│   │   │   ├── invitation.ts
│   │   │   ├── linkhub.ts
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
│   │   │   ├── linkhub
│   │   │   │   ├── controllers.ts
│   │   │   │   └── routes.ts
│   │   │   ├── queue
│   │   │   │   ├── index.ts
│   │   │   │   ├── processors
│   │   │   │   │   ├── sendEmail.ts
│   │   │   │   │   └── updateLastActivity.ts
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
│   │       ├── hash.ts
│   │       ├── logger.ts
│   │       ├── loginThrottle.ts
│   │       ├── normalizeEmail.ts
│   │       ├── sendResponse.ts
│   │       └── tags.ts
│   └── tsconfig.json
└── skills-lock.json

73 directories, 256 files
```
