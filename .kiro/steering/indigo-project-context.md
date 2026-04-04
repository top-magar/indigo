---
inclusion: always
---

# Indigo — Project Context

Multi-tenant e-commerce SaaS for Nepal. Merchants get isolated stores with a visual page editor, local payments (eSewa, Khalti, FonePay), and a Vercel-inspired admin dashboard.

## Stack

- **Framework:** Next.js 16 (App Router), TypeScript (strict), pnpm
- **Database:** Supabase PostgreSQL + RLS, Drizzle ORM
- **Auth:** Supabase Auth (not NextAuth) — `src/lib/auth.ts` is the canonical auth module
- **State:** Zustand (client), React `cache()` (server)
- **UI:** Tailwind CSS v4, shadcn/ui (radix-mira style, neutral base), Lucide icons
- **Editor:** Craft.js (visual page builder), Tiptap (rich text)
- **Payments:** Stripe + local gateways
- **Background jobs:** Inngest
- **AWS:** S3, SES, Bedrock, Rekognition, Comprehend, Polly, Textract, Translate, OpenSearch, Forecast, Personalize, SageMaker Canvas
- **Testing:** Vitest (unit), Playwright (e2e)
- **Charts:** Recharts

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             #   Login, signup
│   ├── (editor)/           #   Visual page editor
│   ├── dashboard/          #   Admin dashboard (see page pattern below)
│   ├── store/[slug]/       #   Tenant storefronts
│   └── api/                #   API routes
├── features/               # Domain modules (each has components/, repositories/, types, actions)
│   ├── editor/             #   Craft.js visual editor, blocks, actions
│   ├── store/              #   Storefront renderer, cart, themes
│   ├── products/           #   Product CRUD, variants, pricing
│   ├── orders/             #   Order management, fulfillment
│   ├── customers/          #   Customer profiles, groups
│   ├── inventory/          #   Stock tracking
│   ├── categories/         #   Category tree
│   ├── collections/        #   Product collections
│   ├── discounts/          #   Vouchers, promotions
│   ├── media/              #   Media library (S3-backed)
│   ├── analytics/          #   Dashboard analytics
│   ├── reviews/            #   Product reviews
│   ├── search/             #   OpenSearch + AI search
│   ├── recommendations/    #   AWS Personalize integration
│   ├── notifications/      #   In-app notifications
│   ├── marketing/          #   Campaigns, automations
│   ├── ai/                 #   AI features
│   ├── attributes/         #   Product attributes
│   ├── cart/               #   Shopping cart
│   ├── dashboard/          #   Dashboard overview
│   └── stores/             #   Store management
├── infrastructure/         # Cross-cutting concerns
│   ├── auth/               #   Session management, websocket auth
│   ├── tenant/             #   Tenant resolution (slug, hostname, context)
│   ├── supabase/           #   Supabase client (server, client, admin)
│   ├── repositories/       #   Base repository pattern (withTenant)
│   ├── db/                 #   Database connection, query utils
│   ├── aws/                #   AWS service wrappers (13 services)
│   ├── services/           #   Business services (email, cache, AI, payments, etc.)
│   ├── workflows/          #   Inngest workflows (order, product, batch)
│   ├── cache/              #   Cache invalidation, widget cache
│   ├── feature-flags/      #   Feature flag system
│   ├── inngest/            #   Inngest client, events, functions
│   └── middleware/         #   Rate limiting
├── components/             # UI components
│   ├── ui/                 #   shadcn/ui primitives
│   ├── dashboard/          #   Dashboard-specific components (51)
│   ├── store/              #   Storefront components
│   └── landing/            #   Marketing site
├── shared/                 # Shared utilities
│   ├── errors.ts           #   AppError, error types
│   ├── utils.ts            #   General utilities
│   ├── dto.ts              #   Data transfer objects
│   ├── constants.ts        #   App constants
│   ├── currency/           #   Currency formatting, exchange rates
│   ├── i18n/               #   Internationalization (7 languages)
│   ├── seo/                #   JSON-LD, metadata
│   ├── validations/        #   Zod schemas
│   ├── types/              #   Shared type definitions
│   └── colors/             #   OKLCH color utilities
├── hooks/                  # 39 custom React hooks
├── db/schema/              # Drizzle ORM schemas (22 tables)
├── config/                 # App configuration (cache, etc.)
├── lib/                    # Library code (auth.ts is here)
├── styles/                 # CSS (animation tokens)
└── content/                # MDX blog content
```

## Design System

**Source of truth:** `design-system/indigo/MASTER.md`
Read it before writing any UI code. Quick reference in `.cursorrules`.

Key rules:
- Flat design, achromatic neutral base. Color only from semantic tokens.
- Font: Inter → system stack. Mono: Geist Mono.
- Dashboard buttons: always `size="sm"`. Cards: `p-4`, no shadow.
- All spacing: 4px base grid. No `dark:` overrides (tokens handle it).
- No emoji icons, no decorative animations, no gradients on buttons/cards.

## Commands

```bash
pnpm dev              # Dev server
pnpm build            # Production build
pnpm db:seed          # Seed mock data
npx tsc --noEmit      # Type check (run after changes)
pnpm test             # Vitest
pnpm test:e2e         # Playwright
```
