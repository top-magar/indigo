# Indigo Marketing Landing Page

The public marketing site at `/` — a dark, analytics-grade SaaS landing page that
reproduces the visual rhythm of the Cypon Analytics reference (dense card
compositions, numbered section markers, live product demos, marquees) using
**original components, original placeholder graphics, and editable content**.

It is built as a set of small, data-driven Server Components with isolated
client islands, so content lives in plain TypeScript data files and the design
lives in one CSS token layer.

---

## 1. Architecture

```
src/app/page.tsx                      # Route: metadata, JSON-LD, fonts, renders LandingV2Page
src/app/landing-v2.css                # All styles + design tokens (single file, ~3.1k lines)
src/components/landing-v2/            # 23 components + motion primitives
src/data/landing/                     # All editable content (no content lives in JSX)
```

Composition order (`landing-v2-page.tsx`), matching the reference:

1. Header (sticky, mega menus, mobile menu)
2. Hero — headline, CTAs, **interactive analytics dashboard demo**
3. Logo marquee — "Trusted by 5000+ top companies" style ticker
4. Metrics — 4 stat cards
5. Features — 6-card bento with mini-viz
6. Integrations — filter tabs + dense logo grid
7. Use cases / Solutions — product, marketing, engineering panels
8. Differentiators — why Indigo
9. Comparison — Indigo vs templated platforms
10. Pricing — NPR plans with annual/monthly toggle
11. Testimonials — merchant stories marquee
12. Blog — insights grid
13. FAQ — accessible accordion
14. Final CTA — gradient band
15. Footer — link columns + newsletter form

## 2. Content customization

All copy, numbers, links, and structure live in `src/data/landing/` — edit these
files and the page updates. No component edits required for content changes.

| File | What it controls |
|---|---|
| `hero.ts` | Hero headline, body, CTA labels + hrefs, note, logo-marquee names |
| `navigation.ts` | Desktop mega-menu items, mobile menu groups, GitHub star count |
| `section-data.ts` | Every numbered section: metrics, integrations, differentiators, comparison, pricing, testimonials, blog posts, FAQ |
| `core.ts` | Health metrics, pricing plan data (NPR), comparison rows, misc. shared data |

Examples:

- **Change a headline**: edit `sectionData.features.headline` in `section-data.ts`.
- **Add a testimonial**: append an object to `sectionData.testimonials.testimonials`
  (quote, author, role, company, metric, initials).
- **Change pricing**: edit `sectionData.pricing.plans[]` — `monthlyPriceNpr: null`
  renders as "Custom". The annual discount is derived from `annualNote`/`monthlyNote`.
- **Add an integration**: append `{ id, name, category }` to
  `sectionData.integrations.rows` (categories are typed — see the `Integration`
  type in `section-data.ts`).
- **Add a FAQ**: append `{ id, question, answer }` to `sectionData.faq.items`
  (JSON-LD FAQ schema in `page.tsx` is generated from the same data).

## 3. Theme customization

The entire design system is CSS custom properties at the top of
`src/app/landing-v2.css` (`:root`). Change a token and every component updates.

| Token | Default | Purpose |
|---|---|---|
| `--lv2-bg` | `#09090b` | Page canvas |
| `--lv2-panel` / `--lv2-panel-2` / `--lv2-panel-3` | `#18181b` / `#131316` / `#101013` | Card surfaces |
| `--lv2-fg` / `--lv2-fg-soft` / `--lv2-muted` | `#f4f5f1` / `#d5d8d1` / `#a1a1a1` | Text scale |
| `--lv2-border` / `--lv2-border-strong` | `rgba(255,255,255,.09)` / `.16` | Hairlines |
| `--lv2-accent` | `#4f39f6` | Primary accent (buttons, active states, chart highlights) |
| `--lv2-highlight` | `#7d87ff` | Accent highlight (charts, links, focus rings) |
| `--lv2-accent-soft` / `--lv2-accent-border` | `rgba(79,57,246,.14)` / `.38` | Accent tints |
| `--lv2-success` / `--lv2-warning` / `--lv2-danger` | `#34d399` / `#e7bb69` / `#ee7e72` | Status colors |
| `--lv2-radius*` | 8–22px | Corner radii (buttons: 10px) |
| `--lv2-container` | `1200px` | Max content width |
| `--lv2-ease` | `cubic-bezier(.22,1,.36,1)` | Motion curve |

To rebrand: change `--lv2-accent` (+ `--lv2-highlight` and the `-soft`/`-border`
tints) and the `--lv2-fg` scale. To go light-theme, swap the `:root` block values
for a light palette (borders become `rgba(0,0,0,…)`, panels become near-white).

Typography uses `Geist` / `Geist Mono` loaded via `next/font` in `page.tsx`
(`--font-indigo-sans`, `--font-indigo-mono`).

## 4. Component overview (`src/components/landing-v2/`)

| Component | Type | Role |
|---|---|---|
| `landing-v2-page.tsx` | Server | Composes the 15 sections |
| `header.tsx` | Client | Sticky nav, scroll state, brand, actions |
| `mega-menu.tsx` | Client | Desktop dropdown (hover + click + Escape + outside-click) |
| `mobile-menu.tsx` | Client | Mobile dialog, accordion groups, Escape/body-lock |
| `hero.tsx` | Client | Staggered entrance, CTAs, dashboard mount |
| `dashboard-preview.tsx` | Client | **Interactive analytics demo** — 7D/30D/90D ranges, hoverable chart, KPI sparklines, live event stream, AI insight card |
| `logo-marquee.tsx` | Server | "Trusted by" ticker (CSS marquee, duplicated track) |
| `marquee.tsx` | Server | Reusable marquee primitive (pause on hover) |
| `metrics.tsx` | Server | 4 stat cards with count-up animation |
| `features.tsx` | Server | 6-card bento with mini-viz (event stream, funnel, heatmap, dashboard, integrations, cohort) |
| `integrations.tsx` | Client | Category tabs + filtered grid + API docs footer |
| `use-cases.tsx` | Server | Three team/use-case panels with inline mockups |
| `differentiators.tsx` | Server | 3 differentiator cards |
| `comparison.tsx` | Server | Two-column comparison table |
| `pricing.tsx` | Client | Annual/monthly `role="switch"` toggle, featured plan ring |
| `testimonials.tsx` | Server | Quote cards (marquee on mobile) |
| `blog.tsx` | Server | Featured post + grid |
| `faq.tsx` | Client | Accessible accordion (`aria-expanded`) |
| `final-cta.tsx` | Server | Gradient CTA band |
| `footer.tsx` | Client | Link columns, validated newsletter form with status |
| `section-heading.tsx` | Server | Eyebrow + `[ 01 of 10 ] · Label` marker + headline |
| `badge.tsx` | Server | Pill badge |
| `motion/reveal.tsx` | Client | Scroll-reveal + `EASE` curve + reduced-motion guard |

## 5. Interactions (all verified)

- Pricing toggle switches prices (NPR 1,999 ↔ 2,499 on Growth)
- Integration tabs filter the grid (All 33 / Payments 6 / …)
- FAQ accordion opens/closes with `aria-expanded`
- Mega menus open on hover, click, and keyboard focus
- Mobile menu: burger → dialog, accordion groups, Escape closes, body scroll lock
- Newsletter form validates email and shows success/error status
- Dashboard demo: 7D/30D/90D segmented control re-renders KPIs, chart, and AI insight
- Reduced motion: all animations disable under `prefers-reduced-motion`

## 6. Verification

```bash
pnpm lint            # 0 errors (786 pre-existing warnings are repo-wide, unrelated)
pnpm exec tsc --noEmit
pnpm run test:run    # 109 tests across 7 files
```

The landing is Server-Component-first: only interactive islands ship client JS.
`next build` may fail in this repo when storefront `generateStaticParams`
queries live Supabase — that is environment noise, not a landing issue.
