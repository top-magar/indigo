# AGENTS.md

> Instructions for AI coding agents working on Indigo — a multi-tenant e-commerce SaaS platform.

## Project Overview

Multi-tenant e-commerce platform for Nepal. Merchants get a dashboard to manage products, orders, customers, and a visual storefront editor to build their store pages.

**Stack**: Next.js 16.1 · React 19 · Supabase (DB + Auth + Storage + Realtime) · Drizzle ORM · Tailwind CSS 4 · shadcn/ui · Zustand 5 · Lucide icons

## Architecture

```
src/
├── app/
│   ├── (auth)/          # Login, signup, onboarding
│   ├── (editor)/        # Visual storefront editor (v1 Craft.js + v2 custom)
│   ├── (marketing)/     # Landing page, blog, pricing
│   ├── api/             # API routes (REST)
│   ├── dashboard/       # Admin panel (products, orders, settings)
│   └── store/[slug]/    # Customer-facing storefront (SSR)
├── components/
│   ├── ui/              # shadcn components (70+ installed)
│   ├── dashboard/       # Dashboard-specific components
│   ├── store/           # Storefront components
│   └── landing/         # Marketing page components
├── db/schema/           # Drizzle ORM schemas (20 tables)
├── features/            # Domain modules (see below)
├── infrastructure/      # DB client, auth, cache, services
└── config/              # App config, constants
```

## Feature Modules

```
features/
├── editor/              # V1 editor (Craft.js) — legacy, being replaced
├── editor-v2/           # V2 editor (custom) — 74 files, 5,982 LOC, 35 blocks
│   ├── blocks/          # Section blocks (hero, product-grid, form, etc.)
│   ├── components/      # Editor UI (canvas, sidebar, settings, toolbar)
│   ├── store.ts         # Zustand store (sections, theme, selection, undo)
│   ├── registry.ts      # Block registry (type-safe field definitions)
│   └── render.tsx       # Storefront renderer (same blocks, live mode)
├── products/            # Product CRUD, variants, images
├── orders/              # Order management, fulfillment
├── customers/           # Customer profiles, groups
├── collections/         # Product collections
├── categories/          # Category tree
├── discounts/           # Discount codes, rules
├── cart/                # Shopping cart
├── inventory/           # Stock tracking
├── analytics/           # Dashboard analytics
├── media/               # Image upload, management
├── marketing/           # Campaigns, email
├── notifications/       # In-app notifications
├── reviews/             # Product reviews
└── store/               # Storefront theme, config
```

## Commands

```bash
pnpm dev              # Dev server (Turbopack)
pnpm build            # Production build
pnpm db:push          # Push schema to DB
npx tsc --noEmit      # Type check — MUST pass before commit
npx playwright test   # E2E tests (15 editor tests)
```

## Key Patterns

### Auth
```typescript
const { user, supabase } = await getAuthenticatedClient()
const tenantId = user.user_metadata.tenant_id
```

### Server Actions
```
src/app/dashboard/products/page.tsx      → Server component (data fetching)
src/app/dashboard/products/*-client.tsx  → Client component (interactivity)
src/features/products/actions.ts         → Server actions (mutations)
```

### Database
- Drizzle ORM with PostgreSQL (Supabase)
- 20 schema files in `src/db/schema/`
- All queries use `tenantId` filter (multi-tenant isolation)
- Never use raw SQL — always Drizzle query builder

### Editor V2 (the visual builder)
- **Store**: Zustand with immer (`src/features/editor-v2/store.ts`)
  - `sections[]` — page content (ordered array of typed blocks)
  - `theme{}` — global design tokens (colors, fonts, spacing)
  - `selectedId` / `selectedIds` — current selection
  - Actions: addSection, removeSection, moveSection, updateProps, updateTheme
- **Blocks**: registered via `registerBlock()` in `blocks/index.ts`
  - Each block: component + fields[] + defaultProps + icon + category
  - 35 blocks across 7 categories
  - Field types: text, richtext, textarea, number, color, select, toggle, image, list, product, collection, link, icon, date, range
- **Canvas**: direct DOM rendering with dnd-kit drag-drop
  - Preview mode: iframe at `/editor-v2/preview` (CSS isolated)
  - Scroll animations via IntersectionObserver
  - Hover effects via CSS :hover with custom properties
- **Theme**: 17 CSS variables applied to viewport frame
  - All consumed by blocks via `var(--store-color-primary)` etc.
  - 6 presets + dark mode + design tokens

### Storefront
- SSR at `/store/[slug]/`
- Uses `RenderSections` from `editor-v2/render.tsx`
- Same block components, `mode: "live"` (fetches real data)
- Theme CSS vars injected from page data

## Code Style

- TypeScript strict mode — no `any`, no `unknown`
- Functional components, hooks only
- All imports at top of file
- Prefer `const` arrow functions
- shadcn/ui for all UI components
- Tailwind for styling — no CSS modules, no styled-components
- Lucide for icons — no emoji icons

## Naming

- Files: kebab-case (`product-grid.tsx`)
- Components: PascalCase (`ProductGrid`)
- Functions/variables: camelCase (`addSection`)
- DB columns: snake_case (`tenant_id`)
- CSS vars: kebab with prefix (`--store-color-primary`)
- Store props with `_` prefix are style props (`_paddingTop`, `_backgroundColor`)

## Git

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
- Single-line commit messages
- `npx tsc --noEmit` must pass before commit
- No `.env` files committed

## Don'ts

- Don't add tests unless explicitly asked
- Don't use `any` or `unknown` types
- Don't add CSS `dark:` variants (we handle dark mode via CSS vars)
- Don't use emoji as icons in UI
- Don't add decorative animations
- Don't commit secrets or API keys
- Don't rewrite unrelated code
- Don't use OOP patterns — prefer functions
- Don't add dependencies without asking

## Dashboard Conventions

- Page titles: `text-xl font-semibold tracking-[-0.4px]`
- Buttons: always `size="sm"`
- Tables: shadcn DataTable with server-side pagination
- Forms: react-hook-form + zod validation
- Toasts: sonner (`toast.success()`, `toast.error()`)
- Loading: skeleton components, not spinners

## Editor V2 Conventions

- Block components: under 50 lines each
- Style props: `_` prefix, stored on section.props
- Theme props: stored on store.theme
- New blocks: register in `blocks/index.ts`, create in `blocks/{name}.tsx`
- Design controls: add to `components/style-manager.tsx`
- Content fields: add field type to `registry.ts`, renderer to `settings-panel.tsx`
- All style values support responsive overrides (`_props_tablet`, `_props_mobile`)

## Resources

- `resources/design-md/` — 62 DESIGN.md files from top brands (Vercel, Stripe, Airbnb, etc.)
- `docs/ENTERPRISE-BUILDER-PROMPT.md` — architecture roadmap
- `e2e/editor-v2.spec.ts` — 15 E2E tests for the editor
