# Indigo Project Context & AI Coding Guidelines

## Project: Indigo (skills.sh)

Multi-tenant e-commerce platform for Nepal. Merchants get isolated stores with visual editor, local payments (eSewa, Khalti, FonePay), and a Vercel Geist-inspired dashboard.

## Tech Stack

- Next.js 16 (App Router) + TypeScript (strict)
- Supabase (PostgreSQL) + Drizzle ORM + RLS
- Tailwind CSS v4 + shadcn/ui + Geist Design System
- Zustand (client state), Inngest (background jobs)
- Stripe Connect (payments), TipTap (rich text), Recharts (charts)
- Vitest (unit), Playwright (E2E)

## Architecture

```
src/
├── app/           # Pages: (auth), (editor), api, dashboard, store/[slug]
├── components/    # ui/ (shadcn+Geist), dashboard/, store/, landing/
├── features/      # Domain modules: products, orders, customers, inventory, editor
├── infrastructure/# Cross-cutting: db, auth, cache, inngest, services
├── db/schema/     # Drizzle ORM schemas
├── hooks/         # React hooks
└── shared/        # Utilities, i18n
```

## Key Conventions

- Auth: `const { user, supabase } = await getAuthenticatedClient()`
- Server files can't export types → put in sibling `types.ts`
- Always verify: `npx tsc --noEmit` = 0 errors
- Dashboard buttons: always `size="sm"`, cards use `p-4`, gap `gap-3`
- See `.cursorrules` for full design system rules

## Reference Resources (in repo)

- `resources/prompt-eng-interactive-tutorial/` — Anthropic's official prompt engineering course
- `resources/awesome-claude-skills/` — Claude skill patterns and examples
- `.kiro/steering/vercel-geist-design-system.md` — Geist design tokens
- `.kiro/steering/vercel-web-interface-guidelines.md` — Vercel UI patterns
- `.cursorrules` — Indigo design system rules (spatial grid, typography, colors)

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm test         # Unit tests
pnpm playwright test  # E2E tests
pnpm lint         # ESLint
pnpm db:push      # DB migrations
```
