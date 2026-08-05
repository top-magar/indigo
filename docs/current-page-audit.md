# Current Page Audit — Indigo Landing V2

Method: Playwright screenshots at 1440/1280/1024/768/390 + computed-style probes +
console-error capture. Vision-model pixel comparison was unavailable (external
API down); geometry was measured programmatically instead.

## Run health (at audit time)

| Check | Result |
|---|---|
| Dev server start | ✅ (localhost:3000) |
| Console errors | ✅ none |
| Hydration warnings | ✅ none |
| Mobile horizontal overflow | ✅ none (390px) |
| H1 count | ✅ exactly 1 (80px/600 Geist) |
| Production build | ✅ passes |
| Lint / tsc / tests | ✅ 0 errors / 0 errors / 109 pass |

## Section-by-section

| Section | Component | Quality | Problems | Verdict |
|---|---|---|---|---|
| Header | `header.tsx`, `mega-menu.tsx`, `mobile-menu.tsx` | Good | No skip-to-content link yet; mega menu has no keyboard roving; star counter is a dead GitHub link | **Refactor** (a11y + skip link) |
| Hero | `hero.tsx` + `dashboard-preview.tsx` | Good base | Dashboard is **static** — no date-range change, no tooltips, no live feed; no entrance animation; hero lacks the reference's atmospheric depth | **Refactor** (interactivity + motion) |
| Logo marquee | `logo-marquee.tsx` + `marquee.tsx` | Good | Works, reduced-motion safe, pause on hover/focus | **Keep** |
| Metrics | `metrics.tsx` | Good | No count-up animation; values render statically | **Refactor** (counter) |
| Feature bento | `features.tsx` | Good | Mini-UIs static — event rows don't animate, funnel bars don't draw on view, no hover tooltip on funnel/cohort | **Refactor** (micro-motion) |
| Integrations | `integrations.tsx` | Good | Filtering works but grid snaps instantly (no layout transition) | **Refactor** (motion layout) |
| Use cases | `use-cases.tsx` | Good | Health table static; attribution bars static | **Refactor** (draw-on-view) |
| Differentiators | `differentiators.tsx` | Weak | Renders data-file cards generically — no real-time streaming badge, no prediction chart, no drag-drop visual | **Replace** with richer originals |
| Comparison | `comparison.tsx` | Good | No row hover highlight | **Refactor** |
| Pricing | `pricing.tsx` | Good | Toggle works; price swap has no animation; no "annual = 2 months free" on all plans | **Refactor** (motion) |
| Testimonials | `testimonials.tsx` | Good | Two-direction marquee, pause on hover/focus | **Keep** |
| Blog | `blog.tsx` | Good | Uses data posts; thumbnails are text monograms (fine, original) | **Keep** |
| FAQ | `faq.tsx` | Good | Accessible accordion, ARIA, rotating icon | **Keep** |
| Final CTA | `final-cta.tsx` | Good | Static gradient + grid bg; no wave/dots animation | **Refactor** (subtle bg motion) |
| Footer | `footer.tsx` | Good | Newsletter validation + success state work | **Keep** |

## Cross-cutting issues (priority-ranked)

**P0**
- None (build, lint, tsc, tests, overflow all green).

**P1**
- Dashboard hero is static — the reference's strongest moment is the large
  product frame; ours renders once and never responds (no date change, no
  tooltip, no live stream).
- No entrance/reveal motion anywhere; page appears "instantly", which reads
  flat next to the reference's staged hero.
- `landing-v2-page.tsx` is one big client component — whole page ships to the
  client (perf).

**P2**
- Differentiators section is generic card output (data-driven, no product
  demonstrations).
- Metrics lack count-up; funnel/attribution/health visuals are static.
- Integration grid snap-filters without layout transition.
- No skip link; mega-menu keyboard roving incomplete.
- FAQ JSON-LD (4 questions in `page.tsx`) doesn't match the 8-item FAQ data.

**P3**
- Final CTA background static; pricing swap unanimated; comparison rows lack
  hover state; hero background atmosphere thin.
