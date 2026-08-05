# Project Audit — Indigo Landing

Audit date: 2026-08-05. Scope: landing page rebuild stack.

## Stack discovered

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.1.0 |
| React | React 19 | 19.2.3 |
| Language | TypeScript strict | ^5.9.3 |
| Package manager | pnpm | — |
| Styling | Tailwind CSS v4 (dashboard) + hand-rolled scoped CSS (`landing-v2.css`) for the landing | ^4.1.18 |
| Rendering | Server Components by default; `"use client"` islands for interactivity | — |
| Caching | `cacheComponents: true` (Next 16) — legacy `revalidate` route exports rejected | — |

## Dependency table

| Package | Version | Purpose | Used? | Where | Decision |
|---|---|---|---|---|---|
| `framer-motion` | ^12.23.26 | Component/in-view animation | ✅ 19 files | dashboard, landing-v2 | **Keep** — primary motion API |
| `motion` | ^12.23.26 | Unified motion (React binding) | ✅ 4 files | `ui/aceternity/*` (imports `motion/react`) | **Keep** — used by aceternity components |
| `recharts` | 2.15.4 | Charts | ✅ 9 files | dashboard analytics | **Keep** (dashboard). Landing uses hand-rolled SVG for pixel control |
| `embla-carousel` / `-react` | ^8.6.0 | Carousels | ❌ 0 files | — | **Removed** — unused (marquee is CSS-driven) |
| `@radix-ui/react-*` | various | Accessible primitives | ✅ via `ui/` wrappers | dialog, dropdown, accordion, popover, slot | **Keep** |
| `class-variance-authority` | ^0.7.1 | Variant API for UI kit | ✅ 10 files | `ui/*` | **Keep** |
| `clsx` | ^2.1.1 | Class merging (via `cn`) | ✅ 1 file | `lib/utils.ts` | **Keep** |
| `tailwindcss` | ^4.1.18 | Utility CSS | ✅ widespread | dashboard, ui | **Keep** (landing CSS is separate by design) |
| `lucide-react` | ^0.562.0 | Icons | ✅ 367 files | everywhere | **Keep** |
| `zustand` | ^5.0.9 | State | ✅ 7 files | editor, dashboard | **Keep** |
| `react-hook-form` | ^7.69.0 | Forms | ✅ 2 files | auth, newsletter patterns | **Keep** |
| `zod` | ^4.2.1 | Validation | ✅ 2+ files | editor schema, forms | **Keep** |
| `@hookform/resolvers` | ^5.2.2 | RHF+zod bridge | ✅ 2 files | auth | **Keep** |
| `date-fns` | ^4.1.0 | Dates | ✅ 48 files | dashboard, store | **Keep** |
| `sonner` | ^2.0.7 | Toasts | ✅ 120 files | app-wide | **Keep** |
| `next-themes` | ^0.4.6 | Theme | ✅ 3 files | layout, dashboard | **Keep** |
| `gsap` | — | ScrollTrigger timelines | ❌ not installed | — | **Do not install** (see animation decision) |
| `lenis` | — | Smooth scroll | ❌ not installed | — | **Do not install** — reference uses native scroll |
| `react-spring` / `animejs` | — | Motion | ❌ not installed | — | Not needed |

## Animation-stack decision — CASE B (Framer Motion installed)

Decision rule CASE B applies: Framer Motion ^12 is installed, integrated (19 files),
and covers every interaction the reference requires:

- Component entrances → `motion.div` with `whileInView` (hero, sections, bento cards)
- Hover states → `whileHover`
- Menu / mobile-menu transitions → existing state-based CSS transitions (fast, no re-render)
- Integration filtering → `layout` transitions on the grid
- Pricing toggle → animated price swap
- Marquee → pure CSS keyframes (already reduced-motion safe; no JS cost)

**Not installing GSAP.** The reference page uses a static dashboard image, CSS
marquees, and scroll-independent reveals — no pinned sections, no scrubbed
timelines, no ScrollTrigger sequences that would justify GSAP's weight. Native
scroll + IntersectionObserver-driven reveals keep the landing light.

Charting: the hero dashboard is a product mockup, not a live chart — hand-rolled
SVG (zero bundle cost, pixel control). Recharts remains for real analytics
screens in the dashboard app and is not imported on the landing.

## Performance notes

- `landing-v2-page.tsx` currently carries `"use client"` — the entire page ships
  as one client bundle. **Action:** demote to a Server Component composing
  client islands (header, integrations, pricing, testimonials, faq, footer,
  dashboard interactions).
- CSS-driven marquee/pulses avoid JS animation cost.
- No images on the landing (all visuals are markup/SVG) — no LCP image risk
  beyond the dashboard mockup itself.
