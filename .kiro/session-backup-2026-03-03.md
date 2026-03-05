# Indigo Codebase Cleanup — Session Backup (2026-03-03)

## OBJECTIVE
Systematic cleanup and structural improvement of the Indigo codebase — a multi-tenant e-commerce platform (Next.js 16 + Tailwind CSS v4 + Geist OKLCH Design System). The user iterates through improvements via "proceed next". Current phase: monster file splits completed, moving to safe-action migration.

## USER GUIDANCE
- Write only the ABSOLUTE MINIMAL amount of code needed
- Verify no breakage: `npx tsc --noEmit` = 0 errors is the standard
- User says "proceed next" to continue through the improvement list
- Prior direction: Chris Do typography-first philosophy, Wix-style landing page structure

## COMPLETED

### Prior Sessions (from earlier checkpoints)
- Complete Wix-style landing page restructure (13 components, 1,259 lines)
- Shared server action wrapper `src/lib/safe-action.ts` (92 lines) — created but NOT yet applied
- Design token migration: 984 → 179 raw `var(--ds-*)` references (82% reduction)
- Zero-risk cleanup: deleted 31 empty dirs, 37 proxy re-export files, rewrote 39 imports
- Relocated misplaced files: block-constants, autosave → features/editor, deleted 883 lines dead code
- Structural: extracted types from ALL 16 server action files into sibling types.ts (Turbopack compatibility), added 12 error boundaries (5→17), 12 loading skeletons (27→39, 100% coverage)
- Logger migration: 130+ files using `createLogger`, 0 `console.error` in dashboard actions or API routes
- Silent catch blocks: Added `log.error()` to 26 silent catch blocks across server-side code
- Dashboard page cleanup: 603 → 386 lines, extracted helpers.ts (91 lines), mini-sparkline.tsx (59 lines)
- Fixed dark mode `bg-white` hardcodes, deduplicated auth fetching, removed AWS widgets, replaced fake metrics

### Dashboard UX Gap Fixes ✅

**Gap 1 (Priority 1): Sidebar Restructure** ✅
- 6 sections → 3 sections (Overview, Content, Marketing)
- Inventory + Attributes nested under Products as sub-items
- Reviews moved to Content section (alongside Media Library)
- Analytics merged into Marketing section
- Removed 4 unused icon imports (Package, Percent, Layers, Filter)
- Low stock badge moved to Products item
- File: `src/components/dashboard/sidebar/sidebar-client.tsx`

**Gap 2 (Priority 2): Remove PerformanceGrid** ✅
- Deleted `PerformanceGrid` component usage, import, and `performanceMetrics` array from `page.tsx`
- Removed unused `conversionRate`/`prevConversionRate` variables

**Gap 3 (Priority 3): Dark Mode** ✅ (verified already working)
- `.dark` CSS class swaps all semantic tokens via CSS variables
- ThemeProvider configured with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`

**Gap 4 (Priority 4): Semantic Color System** ✅
- Migrated ~460 decorative `chart-N` usages → semantic colors across 50+ files
- Mapping: `chart-1` → `primary`, `chart-2` → `success`, `chart-4` → `warning`, `chart-5` → `info`
- Only legitimate `chart-N` remaining are in actual Recharts data visualization components
- Fixed 2 duplicate key TS errors from the migration

**Gap 5: Table Responsiveness** ✅ (already handled)
**Gap 7 (Priority 7): Role-Based Dashboard** ✅
**Gap 8: Motion System** ✅
**Gap 9 (Priority 9): Accessibility** ✅
**Gap 10: More Accessibility** ✅
**Gap 12: Export Capabilities** ✅
**Gap 13: Real-time Updates** ✅ (manual refresh button; ISR removed — see below)
**Gap 14: Empty States** ✅

### Monster File Splits ✅

**Split 1: `products/new/new-product-client.tsx`** ✅
- Extracted `use-product-form.ts` (388 lines) — custom hook with ALL state (30+ useState), effects, handlers, computed values
- Main component: 1,584 → 1,221 lines
- Used `globalThis.FormData` in hook to avoid conflict with local `FormData` type alias

**Split 2: `marketing/actions.ts`** ✅
- Created `campaign-actions.ts` (517 lines) — all campaign CRUD + segments + toggleAutomation
- Main actions.ts: 1,365 → 891 lines
- Re-exports all campaign functions from `actions.ts` so existing imports don't break

**Split 3: `features/media/components/asset-viewer.tsx`** — Skipped
- 1,464 lines but deeply intertwined (30+ state variables cross-referencing image/video/document handlers)
- Extracting hooks would require passing too many cross-references for minimal gain

**Split 4: `sidebar/sidebar-client.tsx`** — Skipped
- 1,150 lines, already well-organized with clear section comments
- 7 internal components tightly coupled via shared state and imports

### Build Fix (This Session) ✅

**Removed `export const revalidate = 60` from `page.tsx`**
- Next.js 16.1.0 with `cacheComponents` config doesn't support route segment `revalidate`
- Manual refresh button in HeroSection (`router.refresh()`) still provides on-demand data refresh

## TECHNICAL CONTEXT

### Key Files Modified
```
src/app/dashboard/page.tsx                           — Removed PerformanceGrid, role checks, removed revalidate
src/components/dashboard/sidebar/sidebar-client.tsx  — Sidebar restructure (6→3 sections)
src/app/globals.css                                  — Motion utilities, focus-visible style
src/app/dashboard/layout.tsx                         — Added id="main-content" aria-label
src/components/dashboard/hero-section.tsx             — Added refresh button with router.refresh()
src/components/dashboard/layout/dashboard-header.tsx  — aria-labels on icon buttons
src/components/dashboard/charts/interactive-chart.tsx — aria-labels on zoom buttons
src/components/dashboard/forms/variant-editor.tsx     — aria-labels on more buttons
src/app/dashboard/products/new/new-product-client.tsx — 1584→1221 lines (hook extraction)
src/app/dashboard/products/new/use-product-form.ts   — NEW (388 lines, extracted hook)
src/app/dashboard/marketing/actions.ts               — 1365→891 lines (campaign split)
src/app/dashboard/marketing/campaign-actions.ts      — NEW (517 lines, campaign functions)
src/app/dashboard/orders/actions.ts                  — Added exportOrders function
```
Plus ~50 files batch-updated via sed for chart-N → semantic color migration.

### Sidebar Navigation Structure
```
OVERVIEW (no label):  Dashboard, Orders (→ All Orders, Returns), Products (→ All, Collections, Categories, Inventory, Attributes), Customers (→ All, Groups)
CONTENT:              Storefront Editor (external), Media Library, Reviews
MARKETING:            Marketing (→ Discounts, Campaigns, Automations), Analytics
FOOTER:               Settings, Theme Toggle, User Menu
```

### Dashboard Page Structure
```
1. SetupWizard (modal, first visit)
2. HeroSection (greeting + today's stats + refresh button)
3. Stripe Connect Alert (conditional, uses warning semantic color)
4. SetupChecklist (conditional)
5. EnhancedMetricCards (filtered by role — staff sees Orders+Customers only)
6. Revenue Chart (2 cols, owner/admin only) + Activity Feed (1 col, full width for staff)
7. RecentOrdersTable
```

### Semantic Color Mapping
```
chart-1 → primary   (orders, processing, confirmed)
chart-2 → success   (revenue, delivered, completed, positive trends)
chart-3 → kept      (only in actual chart components)
chart-4 → warning   (alerts, pending, character limits, notifications)
chart-5 → info      (products, shipped, customers)
```

### Auth Pattern
```typescript
import { getAuthenticatedClient } from "@/lib/auth";
const { user, supabase } = await getAuthenticatedClient();
// user has: id, email, tenantId, role, fullName, avatarUrl
```

### Logger Pattern
```typescript
import { createLogger } from "@/lib/logger";
const log = createLogger("actions:marketing-campaigns");
```

### Turbopack Constraint
`"use server"` files CANNOT export types. All types live in sibling `types.ts` files.

### CSS Utilities Added
```css
@utility transition-snappy { /* 150ms, cubic-bezier(0.2, 0, 0, 1) */ }
@utility transition-smooth { /* 250ms, cubic-bezier(0.2, 0, 0, 1) */ }
@utility ease-snappy { /* cubic-bezier(0.2, 0, 0, 1) */ }
:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; border-radius: var(--radius-sm, 4px); }
```

## NEXT STEPS (Resume Here)

1. **Migrate action files to `safe-action.ts` wrapper** — infrastructure exists at `src/lib/safe-action.ts` (92 lines) but is unused
2. **Remaining `console.log`** — ~190 across client components and infrastructure
3. **Typography hierarchy** (Gap 6) — requires touching dozens of components; deferred as design system pass
4. **Virtual scrolling** (Gap 11) — requires `@tanstack/react-virtual` dependency; deferred
