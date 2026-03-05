# Indigo Dashboard — Full UI/UX Audit Report
## Senior SaaS UI/UX Audit • March 2026

---

## Executive Summary

Indigo is an e-commerce dashboard built on Next.js 16 + Tailwind v4 + Geist OKLCH. After two passes of design system enforcement, the codebase is **significantly cleaner** than typical early-stage SaaS. However, several critical gaps remain that would prevent it from reaching Linear/Stripe quality.

### Overall Score: 6.8/10

| Category | Score | Status |
|----------|-------|--------|
| Design System Compliance | 8.5/10 | ✅ Strong |
| Typography & Hierarchy | 7.5/10 | ✅ Good |
| Spacing & Density | 8.0/10 | ✅ Good |
| Accessibility (WCAG 2.2 AA) | 4.5/10 | 🔴 Critical |
| Empty States & Onboarding | 6.0/10 | 🟡 Needs Work |
| Page Structure Consistency | 5.5/10 | 🟡 Needs Work |
| Responsive Design | 5.0/10 | 🟡 Needs Work |
| Interaction & Feedback | 7.0/10 | ✅ Good |
| Performance Patterns | 7.5/10 | ✅ Good |
| Navigation & Wayfinding | 8.0/10 | ✅ Good |

---

## 1. Design System Compliance (8.5/10) ✅

### What's Working
- **Zero violations** on: font-bold, text-lg, text-base, text-2xl, rounded-xl, rounded-2xl, p-6, gap-6, space-y-6
- Consistent `stat-value` (28px) and `stat-label` (11px/uppercase) classes
- 4px spatial grid enforced
- 3 border radii only (4/6/8px)
- Button sizing standardized (`size="sm"` default)

### Remaining Issues
| Issue | Count | Severity |
|-------|-------|----------|
| `h-12 w-12` (team avatar — intentional) | 1 | Low |
| Unsized multiline `<Button>` tags | 5 → 0 (fixed this session) | Fixed |
| `shadow-md` on cards | 4 → 2 (fixed this session) | Low |
| `shadow-md` on popover/dropdown (acceptable) | 2 | None |

---

## 2. Typography & Hierarchy (7.5/10) ✅

### What's Working
- 5-size type scale enforced (20/28/14/14/12px)
- `font-semibold` everywhere (no `font-bold`)
- `tabular-nums` on monetary values in tables
- Chart + sentence pattern on revenue chart

### Issues
| Issue | Impact | Priority |
|-------|--------|----------|
| **No `<h1>` on 15 of 16 pages** — page titles are in client components, not in `page.tsx` server components. SEO and screen readers miss them. | High | P1 |
| No `<h2>` semantic structure on most pages — section titles use `<p>` or `<CardTitle>` instead | Medium | P2 |
| Missing 13px secondary text adoption in tables — class exists but not yet applied | Low | P3 |

---

## 3. Spacing & Density (8.0/10) ✅

### What's Working
- `space-y-4` dominant (41 instances) — correct
- `gap-3` for card grids, `gap-4` for sections
- `p-4` dominant in cards (511 instances)
- No `p-6` or `p-8` remaining in cards

### Issues
| Issue | Count | Priority |
|-------|-------|----------|
| `space-y-8` in marketing page | 1 → 0 (fixed) | Fixed |
| `p-5` in hero section (should be `p-4`) | 1 | Low |
| Some `gap-2` where `gap-3` would be more consistent | ~210 | Low — context-dependent |

---

## 4. Accessibility (WCAG 2.2 AA) (4.5/10) 🔴 CRITICAL

This is the biggest gap. A Shopify-class product needs AA compliance.

### Critical Issues

| Issue | Count | WCAG Criterion | Priority |
|-------|-------|----------------|----------|
| **Icon buttons without `aria-label`** | 66 | 1.1.1 Non-text Content | P0 |
| **Images without `alt` text** | 31 | 1.1.1 Non-text Content | P0 |
| **`text-muted-foreground/50` — fails 4.5:1 contrast** | 31 | 1.4.3 Contrast (Minimum) | P0 |
| **Inputs without associated labels** | 114 | 1.3.1 Info and Relationships | P1 |
| **Select elements without labels** | ~20 | 1.3.1 Info and Relationships | P1 |
| **No skip-to-content link** | 1 | 2.4.1 Bypass Blocks | P1 |
| **No visible focus indicators on custom components** | Unknown | 2.4.7 Focus Visible | P1 |

### Contrast Failures
- `text-muted-foreground/50` = ~50% opacity on already-muted text → likely **2:1 ratio** (needs 4.5:1)
- `text-muted-foreground/30` = ~30% opacity → **fails completely**
- Used on: icons in empty states, filter labels, secondary metadata

### Recommendation
Replace all `/50` and lower opacity modifiers on text with:
- `/70` minimum for decorative icons
- Full `text-muted-foreground` for any readable text
- Remove opacity modifiers from text entirely — use semantic color tokens

---

## 5. Empty States & Onboarding (6.0/10) 🟡

### What's Working
- `EmptyState` component with `hint` prop (keyboard shortcuts)
- Products, Orders, Customers have proper empty states
- Setup wizard and checklist for new stores
- Revenue chart has empty state

### Issues
| Issue | Priority |
|-------|----------|
| **Inventory has no empty state** | P1 |
| **Finances has no empty state** | P1 |
| **Pages editor has no empty state** | P2 |
| Orders empty state was inline HTML (now fixed to use component) | Fixed |
| Not all empty states have `hint` prop | P3 |

---

## 6. Page Structure Consistency (5.5/10) 🟡

### The Problem
Each list page (Products, Orders, Customers, Inventory) has a **different layout structure**. There's no shared page template.

### Current State
| Page | Title | Search | Filters | Table | Pagination | Empty State |
|------|-------|--------|---------|-------|------------|-------------|
| Products | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Orders | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Customers | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Marketing | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Analytics | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |

### Recommendation
- `<PageHeader>` component was created this session — adopt it across all list pages
- Standardize: Title → Search+Filters → Table → Pagination → Empty State
- Every list page should follow the same vertical rhythm

---

## 7. Responsive Design (5.0/10) 🟡

### Issues
| Issue | Priority |
|-------|----------|
| 63 elements hidden on mobile (`hidden sm:`) but only 3 mobile-specific alternatives | P1 |
| Tables don't have mobile card-view alternatives | P1 |
| No mobile-optimized metric cards (they stack but don't adapt) | P2 |
| Command palette works on mobile but shortcut hints are irrelevant | Low |

### What's Working
- Sidebar collapses properly
- Grid layouts use responsive breakpoints (`sm:grid-cols-2 lg:grid-cols-4`)
- Mobile bottom nav exists

---

## 8. Interaction & Feedback (7.0/10) ✅

### What's Working
- 259 hover states, 186 transitions, 130 animations
- Command palette with ⌘K
- Linear-style G+key navigation shortcuts
- Hover-to-reveal actions on table rows
- Loading skeletons (40 loading.tsx files)

### Issues
| Issue | Priority |
|-------|----------|
| Only 3 Suspense boundaries — most data fetching blocks the whole page | P2 |
| No optimistic UI updates (all mutations wait for server) | P2 |
| No toast/feedback on bulk actions | P2 |

---

## 9. Performance Patterns (7.5/10) ✅

### What's Working
- Parallel data fetching with `Promise.all` on dashboard home
- 40 loading.tsx skeleton files
- Server components for data fetching
- Client components only where needed

### Issues
| Issue | Priority |
|-------|----------|
| Only 3 Suspense boundaries — could stream more | P2 |
| No SWR/React Query for client-side data | P3 |
| Large client bundles (orders-client.tsx is likely 1000+ lines) | P3 |

---

## 10. Navigation & Wayfinding (8.0/10) ✅

### What's Working
- Dynamic breadcrumbs with parent route mapping
- Full command palette with 25+ routes
- Keyboard shortcuts (G+key, C for create)
- Sidebar with collapsible sections
- Shortcut hints in command palette

### Issues
| Issue | Priority |
|-------|----------|
| Breadcrumbs hidden on mobile | P2 |
| No "back" button on detail pages | P2 |
| No keyboard shortcut help overlay (? key) | P3 |

---

## Priority Action Plan

### P0 — Ship Blockers (Accessibility)
1. Add `aria-label` to all 66 icon-only buttons
2. Add `alt` text to all 31 images
3. Replace `text-muted-foreground/50` and `/30` with `/70` minimum
4. Add labels to form inputs (use `sr-only` class if visual label not desired)

### P1 — Quality Bar (Structure)
5. Add `<h1>` to all 15 pages missing them
6. Add empty states to Inventory, Finances, Pages
7. Adopt `<PageHeader>` across all list pages
8. Add mobile card-view alternatives for tables
9. Add skip-to-content link in layout

### P2 — Polish (Linear/Stripe Quality)
10. Add `<h2>` semantic structure to sections
11. Increase Suspense boundaries for streaming
12. Add optimistic UI for common mutations
13. Add keyboard shortcut help overlay (? key)
14. Add "back" button on detail pages

### P3 — Nice to Have
15. Apply `text-secondary-data` (13px) to table metadata
16. Add SWR for client-side data freshness
17. Split large client components into smaller chunks
