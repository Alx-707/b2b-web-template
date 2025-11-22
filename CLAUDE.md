# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Modern B2B enterprise website template using Next.js 16 + React 19 + TypeScript 5.9 + Tailwind CSS 4. Features English/Chinese internationalization, theme switching, and responsive design.

Project structure guardrails: `src/app` (App Router), `src/components` (shared UI), `src/features` (vertical slices), `src/lib`/`src/shared` (utils), `src/config` (flags/theme), `content` & `messages` (MDX + i18n critical/deferred), `public` (assets), `tests` (Vitest/Playwright), `scripts` (automation)。使用 `@/` alias，禁止 `export *`（架构 hook 会阻止）。

## Essential Commands

```bash
# Development
pnpm install          # Install dependencies (Node 20.x, pnpm 10.13.x required)
pnpm dev              # Start dev server (Turbopack by default)

# Quality checks
pnpm type-check       # TypeScript type checking
pnpm lint:check       # ESLint checking
pnpm lint:fix         # Auto-fix ESLint issues
pnpm format:write     # Prettier formatting
pnpm format:check     # Prettier check

# Testing
pnpm test             # Run Vitest unit tests
pnpm test:coverage    # Run tests with coverage report
pnpm test:e2e         # Run Playwright E2E tests (builds first, uses production mode)
pnpm test:e2e:no-reuse # Playwright with clean contexts
pnpm i18n:full        # Scan/sync/validate translations
pnpm validate:translations # Validate translation layers

# Full validation
pnpm ci:local         # Complete CI check: build + lint + tests
pnpm quality:gate     # Type-check + lint + quality gates
pnpm security:check   # npm audit + semgrep security scan
pnpm config:check     # Validate config

# Build
pnpm build            # Production build (Turbopack)
pnpm start            # Start production server
```

## Architecture

### Directory Structure
- `src/app/[locale]/` - Next.js App Router with locale-based routing (en/zh)
- `src/components/` - Shared UI components (Radix UI + Tailwind)
- `src/config/` - Feature flags, theme config, contact form config
- `src/lib/` - Utility functions and core logic
- `src/i18n/` - Internationalization setup (next-intl)
- `messages/` - Translation files with critical/deferred split per locale

### Internationalization
Uses next-intl with layered translation architecture:
- `messages/{locale}/critical.json` - First-paint translations (Header, Footer, Hero)
- `messages/{locale}/deferred.json` - Lazy-loaded translations
- Validate with: `pnpm validate:translations`

### Testing Structure
- Unit tests: Vitest + Testing Library in `src/**/*.test.ts(x)` or `tests/unit/`
- E2E tests: Playwright in `tests/e2e/`; prefer recording only when必要；`pnpm test:e2e:no-reuse` 用于隔离上下文。
- Test setup: `src/test/setup.ts`
- RTL 查询优先使用 role/text，避免脆弱选择器。关键逻辑需补充 edge cases（i18n fallback、feature flags、SSR/CSR 边界），变更后跑 `pnpm test:coverage`。

## Code Style

- Use `@/` path alias for imports (configured in tsconfig.json)
- Avoid `export *` re-exports (blocked by pre-commit hooks)
- ESLint forbids Jest imports; use Vitest APIs
- Follow Conventional Commits: `feat|fix|docs|style|refactor|test|chore(scope): summary`
- Components in PascalCase, hooks/functions in camelCase, files in kebab-case
- Prettier 2-space、单引号（where configured）、导入排序、Tailwind class ordering；ESLint 限制 max 3 params、prefer const、无 `console`（app code）、安全规则。

## Commit & PR Guidelines

- 提交遵循 Conventional Commits，subject ≤72 chars；Lefthook 在 commit 时运行 format/type/lint/architecture/i18n 检查。
- PR 需附 issue 链接、变更范围、测试证据（`pnpm test`/`pnpm test:e2e`/`pnpm ci:local` 输出），UI 变更附截图/视频；保持 PR 小而聚焦。

## Key Configuration Files

- `next.config.ts` - Next.js config with MDX, next-intl, bundle analyzer plugins
- `vitest.config.mts` - Vitest config with jsdom environment, coverage thresholds
- `playwright.config.ts` - E2E config, runs production build for tests
- `src/config/contact-form-config.ts` - Contact form field configuration
- `src/config/security.ts` - Security headers configuration

## Environment Variables

Required for local development:
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Cloudflare Turnstile public key
- `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret key

Optional:
- `ENABLE_WHATSAPP_CHAT` / `NEXT_PUBLIC_WHATSAPP_NUMBER` - WhatsApp floating button
- `ENABLE_SENTRY_BUNDLE` - Enable Sentry (disabled by default for performance)

## Security & Configuration

- Secrets 仅存 `.env.local`，避免提交真实凭据；新增入口禁止使用 `export *` 以通过安全 lint。
- Conductor 暂不启用：Next.js 16 场景下 next-intl 支持不完善，待官方完善后再评估开启，期间请勿启用。

## Agent Instructions

- All thinking and responses should be in Chinese; keep technical terms in English (lint, hook, coverage, alias)
- Before coding, query official documentation via context7 to align with latest best practices
