# Directory Structure

```
.
├── .agents
│   └── skills
│       ├── architecture-blueprint-generator
│       │   └── SKILL.md
│       ├── brainstorming
│       │   ├── scripts
│       │   │   ├── frame-template.html
│       │   │   ├── helper.js
│       │   │   ├── server.cjs
│       │   │   ├── start-server.sh
│       │   │   └── stop-server.sh
│       │   ├── SKILL.md
│       │   ├── spec-document-reviewer-prompt.md
│       │   └── visual-companion.md
│       ├── create-readme
│       │   └── SKILL.md
│       ├── documentation-writer
│       │   └── SKILL.md
│       ├── shadcn
│       │   ├── agents
│       │   │   └── openai.yml
│       │   ├── assets
│       │   │   ├── shadcn.png
│       │   │   └── shadcn-small.png
│       │   ├── cli.md
│       │   ├── customization.md
│       │   ├── evals
│       │   │   └── evals.json
│       │   ├── mcp.md
│       │   ├── rules
│       │   │   ├── base-vs-radix.md
│       │   │   ├── composition.md
│       │   │   ├── forms.md
│       │   │   ├── icons.md
│       │   │   └── styling.md
│       │   └── SKILL.md
│       └── ui-ux-pro-max
│           ├── data
│           │   ├── charts.csv
│           │   ├── colors.csv
│           │   ├── icons.csv
│           │   ├── landing.csv
│           │   ├── products.csv
│           │   ├── react-performance.csv
│           │   ├── stacks
│           │   │   ├── astro.csv
│           │   │   ├── flutter.csv
│           │   │   ├── html-tailwind.csv
│           │   │   ├── jetpack-compose.csv
│           │   │   ├── nextjs.csv
│           │   │   ├── nuxtjs.csv
│           │   │   ├── nuxt-ui.csv
│           │   │   ├── react.csv
│           │   │   ├── react-native.csv
│           │   │   ├── shadcn.csv
│           │   │   ├── svelte.csv
│           │   │   ├── swiftui.csv
│           │   │   └── vue.csv
│           │   ├── styles.csv
│           │   ├── typography.csv
│           │   ├── ui-reasoning.csv
│           │   ├── ux-guidelines.csv
│           │   └── web-interface.csv
│           ├── scripts
│           │   ├── core.py
│           │   ├── design_system.py
│           │   ├── __pycache__
│           │   │   ├── core.cpython-314.pyc
│           │   │   ├── design_system.cpython-314.pyc
│           │   │   └── search.cpython-314.pyc
│           │   └── search.py
│           └── SKILL.md
├── client
│   ├── components.json
│   ├── .env
│   ├── .env.example
│   ├── next.config.ts
│   ├── next-env.d.ts
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
│   │   │   ├── favicon.ico
│   │   │   ├── features
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   ├── (legal)
│   │   │   │   ├── about
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── contact-us
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
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
│   │   │   ├── loading.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── page.tsx
│   │   │   ├── (redirecting)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── r
│   │   │   │       └── [shortCode]
│   │   │   │           └── page.tsx
│   │   │   ├── (tools)
│   │   │   │   ├── layout.tsx
│   │   │   │   └── qr-generator
│   │   │   │       └── page.tsx
│   │   │   └── (workspaces)
│   │   │       ├── layout.tsx
│   │   │       └── w
│   │   │           ├── new
│   │   │           │   └── page.tsx
│   │   │           ├── page.tsx
│   │   │           └── [workspaceID]
│   │   │               ├── bulk-upload
│   │   │               │   └── page.tsx
│   │   │               ├── create-url
│   │   │               │   └── page.tsx
│   │   │               ├── layout.tsx
│   │   │               ├── page.tsx
│   │   │               └── [shortCode]
│   │   │                   ├── edit
│   │   │                   │   └── page.tsx
│   │   │                   └── page.tsx
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
│   ├── tsconfig.json
│   └── tsconfig.tsbuildinfo
├── docs
│   ├── architecture
│   │   ├── AUTHENTICATION_AND_SESSION_MANAGEMENT_ARCHITECTURE.md
│   │   ├── CI_CD_PIPELINE_ARCHITECTURE.md
│   │   └── RATE_LIMITER_ARCHITECTURE.md
│   ├── DIRECTORY_STRUCTURE.md
│   └── SETUP.md
├── .editorconfig
├── .env
├── eslint.config.ts
├── .github
│   ├── dependabot.yml
│   └── workflows
│       └── ci.yml
├── .gitignore
├── .husky
│   ├── _
│   │   ├── applypatch-msg
│   │   ├── commit-msg
│   │   ├── .gitignore
│   │   ├── h
│   │   ├── husky.sh
│   │   ├── post-applypatch
│   │   ├── post-checkout
│   │   ├── post-commit
│   │   ├── post-merge
│   │   ├── post-rewrite
│   │   ├── pre-applypatch
│   │   ├── pre-auto-gc
│   │   ├── pre-commit
│   │   ├── pre-merge-commit
│   │   ├── prepare-commit-msg
│   │   ├── pre-push
│   │   └── pre-rebase
│   └── pre-push
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── .prettierignore
├── .prettierrc
├── public
│   └── preview.png
├── README.md
├── scripts
│   ├── clean-all.js
│   ├── install-all.js
│   ├── reset-all.js
│   └── update-geolite2.js
├── server
│   ├── .env.development
│   ├── .env.example
│   ├── .env.production
│   ├── logs
│   │   ├── app-development.log
│   │   └── error-development.log
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── src
│   │   ├── config
│   │   │   ├── argon2.ts
│   │   │   ├── checkEnv.ts
│   │   │   ├── cloudinary.ts
│   │   │   ├── env.ts
│   │   │   └── mailer.ts
│   │   ├── constants
│   │   │   ├── app.ts
│   │   │   ├── GeoLite2-City.mmdb
│   │   │   ├── GeoLite2-City.mmdb.backup
│   │   │   ├── regex.ts
│   │   │   └── tags.ts
│   │   ├── db
│   │   │   ├── connectMongo.ts
│   │   │   └── connectRedis.ts
│   │   ├── index.ts
│   │   ├── middlewares
│   │   │   ├── httpLogger.ts
│   │   │   ├── IP.ts
│   │   │   ├── location.ts
│   │   │   ├── protectRoute.ts
│   │   │   ├── rateLimiter.ts
│   │   │   ├── UAParser.ts
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
├── skills-lock.json
├── .vercel
│   ├── project.json
│   └── README.txt
└── .vercelignore

96 directories, 339 files
```
