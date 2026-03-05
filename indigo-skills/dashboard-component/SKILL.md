---
name: dashboard-component
description: Create dashboard components for the Indigo e-commerce platform following Vercel/Geist design system with OKLCH tokens. Use when building new dashboard pages, widgets, forms, tables, or any admin UI component.
---

# Dashboard Component Builder

Build dashboard components for Indigo using Vercel/Geist design patterns with OKLCH color tokens.

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui + Lucide icons

## Architecture

Every dashboard module follows this file structure:
```
src/app/dashboard/{module}/
├── page.tsx              → Server component (auth + data fetch)
├── loading.tsx           → Skeleton (Next.js auto-wraps with Suspense)
├── error.tsx             → Error boundary
├── {module}-client.tsx   → Client component (interactive UI)
├── actions.ts            → Server actions (return { success, error? })
└── types.ts              → Shared types
```

## Component Creation Workflow

### Step 1: Think Through States (Precognition)
Before writing code, enumerate ALL states:
1. **Loading** — Skeleton matching final layout dimensions
2. **Empty** — Message + CTA, never a dead end
3. **Error** — Inline error with retry action
4. **Sparse** — 1-2 items, no awkward gaps
5. **Dense** — 100+ items, virtualize if needed
6. **Mobile** — Stacked layout, touch targets ≥44px
7. **Dark mode** — Tokens auto-switch, no explicit `dark:` overrides
8. **Keyboard** — Full navigation, visible `:focus-visible` rings
9. **Screen reader** — `aria-label` on icon buttons, `aria-live` for updates

### Step 2: Choose Pattern Template
- **Data table page** → Reference `src/app/dashboard/products/`
- **Settings page** → Reference `src/app/dashboard/settings/`
- **Detail page** → Reference `src/app/dashboard/orders/[id]/`
- **Wizard/multi-step** → Reference `src/app/dashboard/products/new/`
- **Analytics widget** → Reference `src/app/dashboard/analytics/`

### Step 3: Build Using Token System

**CRITICAL RULES:**
- NEVER use hardcoded hex values (`bg-[#xxx]`)
- NEVER use raw Tailwind colors (`bg-gray-100`)
- ALWAYS use semantic tokens or CSS variables
- NEVER add `dark:` overrides — tokens handle dark mode automatically
- NEVER use `font-bold` — use `font-semibold` or `font-medium`

### Step 4: Validate
Run `references/audit-checklist.md` against the component.

## Token Quick Reference

See `references/tokens.md` for the full OKLCH token system.

## Component Patterns

See `references/patterns.md` for reusable component patterns.

## Design Guidelines

See `references/guidelines.md` for Vercel web interface rules.
