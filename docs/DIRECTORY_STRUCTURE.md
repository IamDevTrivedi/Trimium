# Directory Structure

```
.
├── .agents
│   └── skills
│       ├── architecture-blueprint-generator
│       │   └── SKILL.md
│       ├── aws-diagrams-skill
│       │   ├── references
│       │   │   ├── center_nodes.py
│       │   │   └── template.py
│       │   ├── SKILL.md
│       │   └── gotchas.md
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
│       │   │   ├── shadcn-small.png
│       │   │   └── shadcn.png
│       │   ├── evals
│       │   │   └── evals.json
│       │   ├── rules
│       │   │   ├── base-vs-radix.md
│       │   │   ├── composition.md
│       │   │   ├── forms.md
│       │   │   ├── icons.md
│       │   │   └── styling.md
│       │   ├── SKILL.md
│       │   ├── cli.md
│       │   ├── customization.md
│       │   └── mcp.md
│       ├── ui-ux-pro-max
│       │   ├── data
│       │   │   ├── stacks
│       │   │   │   ├── astro.csv
│       │   │   │   ├── flutter.csv
│       │   │   │   ├── html-tailwind.csv
│       │   │   │   ├── jetpack-compose.csv
│       │   │   │   ├── nextjs.csv
│       │   │   │   ├── nuxt-ui.csv
│       │   │   │   ├── nuxtjs.csv
│       │   │   │   ├── react-native.csv
│       │   │   │   ├── react.csv
│       │   │   │   ├── shadcn.csv
│       │   │   │   ├── svelte.csv
│       │   │   │   ├── swiftui.csv
│       │   │   │   └── vue.csv
│       │   │   ├── charts.csv
│       │   │   ├── colors.csv
│       │   │   ├── icons.csv
│       │   │   ├── landing.csv
│       │   │   ├── products.csv
│       │   │   ├── react-performance.csv
│       │   │   ├── styles.csv
│       │   │   ├── typography.csv
│       │   │   ├── ui-reasoning.csv
│       │   │   ├── ux-guidelines.csv
│       │   │   └── web-interface.csv
│       │   ├── scripts
│       │   │   ├── __pycache__
│       │   │   │   ├── core.cpython-314.pyc
│       │   │   │   ├── design_system.cpython-314.pyc
│       │   │   │   └── search.cpython-314.pyc
│       │   │   ├── core.py
│       │   │   ├── design_system.py
│       │   │   └── search.py
│       │   └── SKILL.md
│       └── writing-plans
│           ├── SKILL.md
│           └── plan-document-reviewer-prompt.md
├── .github
│   ├── workflows
│   │   ├── ci.yml
│   │   └── update-directory-structure.yml
│   └── dependabot.yml
├── .husky
│   └── pre-commit
├── client
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
│   │   │   │   │   ├── set-password
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── set-profile
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── verify
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── email-logout
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── login
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── logout
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── reset-password
│   │   │   │   │   ├── set-password
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── verify
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (legal)
│   │   │   │   ├── about
│   │   │   │   │   ├── about-content.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── contact-us
│   │   │   │   │   ├── contact-page-client.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── privacy-policy
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── terms-of-service
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── legal-content.tsx
│   │   │   ├── (linkhub)
│   │   │   │   ├── linkhub-editor
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── t
│   │   │   │       └── [username]
│   │   │   │           └── page.tsx
│   │   │   ├── (redirecting)
│   │   │   │   ├── r
│   │   │   │   │   └── [shortCode]
│   │   │   │   │       └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (tools)
│   │   │   │   ├── qr-generator
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (workspaces)
│   │   │   │   ├── w
│   │   │   │   │   ├── [workspaceID]
│   │   │   │   │   │   ├── [shortCode]
│   │   │   │   │   │   │   ├── edit
│   │   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── bulk-upload
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── create-url
│   │   │   │   │   │   │   └── page.tsx
│   │   │   │   │   │   ├── layout.tsx
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── new
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── features
│   │   │   │   ├── features-page-client.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── favicon.ico
│   │   │   ├── globals.css
│   │   │   ├── home-page-client.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── not-found-client.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── components
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
│   │   │   ├── shortcut-palette.tsx
│   │   │   ├── shortcuts-provider.tsx
│   │   │   ├── theme-provider.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── top-back-button.tsx
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
│   │   │   ├── notice.ts
│   │   │   ├── regex.ts
│   │   │   ├── shortcuts.ts
│   │   │   ├── socials.tsx
│   │   │   └── tags.ts
│   │   ├── hooks
│   │   │   ├── use-hotkey.ts
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
│   ├── bun.lock
│   ├── components.json
│   ├── next.config.mjs
│   ├── package.json
│   ├── postcss.config.mjs
│   └── tsconfig.json
├── docs
│   ├── architecture
│   │   ├── AUTHENTICATION_AND_SESSION_MANAGEMENT_ARCHITECTURE.md
│   │   ├── CI_CD_PIPELINE_ARCHITECTURE.md
│   │   └── RATE_LIMITER_ARCHITECTURE.md
│   ├── diagrams
│   │   ├── trimium-architecture-dark.png
│   │   └── trimium-architecture.png
│   ├── superpowers
│   │   ├── plans
│   │   │   ├── 2026-09-05-error-message-audit.md
│   │   │   └── 2026-09-05-otp-migration.md
│   │   └── specs
│   │       └── 2026-09-05-otp-migration-design.md
│   ├── DIRECTORY_STRUCTURE.md
│   └── SETUP.md
├── scripts
│   ├── clean-all.js
│   ├── dev.js
│   ├── generate-architecture.py
│   ├── install-all.js
│   ├── reset-all.js
│   └── update-geolite2.js
├── server
│   ├── src
│   │   ├── config
│   │   │   ├── argon2.ts
│   │   │   ├── checkEnv.ts
│   │   │   ├── cloudinary.ts
│   │   │   ├── env.ts
│   │   │   ├── mailer.ts
│   │   │   └── swagger.ts
│   │   ├── constants
│   │   │   ├── notice.ts
│   │   │   ├── regex.ts
│   │   │   ├── tags.ts
│   │   │   └── time.ts
│   │   ├── db
│   │   │   ├── connectMongo.ts
│   │   │   └── connectRedis.ts
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
│   │   │   │   ├── processors
│   │   │   │   │   ├── sendEmail.ts
│   │   │   │   │   └── updateLastActivity.ts
│   │   │   │   ├── index.ts
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
│   │   ├── utils
│   │   │   ├── date.ts
│   │   │   ├── emailTemplates.ts
│   │   │   ├── generateOTP.ts
│   │   │   ├── generateShortCode.ts
│   │   │   ├── getWorkspacePerformance.ts
│   │   │   ├── hash.ts
│   │   │   ├── logger.ts
│   │   │   ├── loginThrottle.ts
│   │   │   ├── normalizeEmail.ts
│   │   │   ├── sendResponse.ts
│   │   │   ├── shutdown.ts
│   │   │   └── tags.ts
│   │   └── index.ts
│   ├── bun.lock
│   ├── docker-compose.yml
│   ├── package.json
│   └── tsconfig.json
├── .editorconfig
├── .env.example
├── .gitignore
├── .vercelignore
├── AGENTS.md
├── LICENSE
├── README.md
├── biome.json
├── bun.lock
├── package.json
└── skills-lock.json

99 directories, 336 files
```
