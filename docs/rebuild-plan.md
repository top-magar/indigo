# Rebuild Plan — Indigo Landing V2 (round 2)

> Status: **implementation complete.** Round 2 (interactivity + motion + architecture
> split) landed; all gates green. Remaining differences listed at the bottom.

## Round-2 work delivered

| Area | Delivered |
|---|---|
| Dashboard | Interactive: 7D/30D/90D date range drives KPIs, revenue chart, channels, insight; chart tooltip on hover; 4 KPI sparklines; live event feed (new rows every ~3s, AnimatePresence); live badges; AI insight card that swaps per range |
| Hero | Staged entrance (headline → CTAs → dashboard rise, 0.45s delay, EASE [0.22,1,0.36,1]); layered atmospheric glow behind headline |
| Metrics | Count-up on view (rAF, easeOutCubic, 1.4s, suffix-aware, reduced-motion jumps) |
| Feature bento | Cycling event stream; selectable funnel stages with drop-off tooltip; heatmap pointer highlight; cohort cell tooltips (fixed-position, focusable cells); animated bento card reveals; integrated mini dashboard card |
| Use cases | Live-dashboard card (KPIs + health table), scheduling card, attribution bars that draw on view |
| Differentiators | Rebuilt as 5 live demos: streaming (cycling events), AI (forecast path draw + switchable model tabs), builder (drag-over drop zone), enterprise (shield), performance (3×) |
| Integrations | (kept) category tabs with live filter |
| Pricing | Real annual/monthly switch (was stuck on annual); animated price swap; dynamic billing notes; "2 Months Free" badge only in annual |
| Comparison | (kept) two-column table, hover row highlight |
| Final CTA | Copy cleaned (removed meta note); slow atmospheric bg drift |
| Architecture | `landing-v2-page.tsx` demoted to a Server Component composing client islands |
| A11y | Skip-to-content link; FAQ open-by-default; ARIA switch for billing; focusable cohort cells; keyboard hover equivalents (onFocus) on funnel/heatmap/cohort |
| SEO/consistency | FAQ JSON-LD now derived from the same data source as the FAQ section (8 items) |
| Dependencies | Removed `embla-carousel` + `embla-carousel-react` (0 usages, confirmed); `motion` retained after audit correction (used by `ui/aceternity/*`) |
| Docs | `project-audit.md`, `current-page-audit.md`, `reference-analysis.md`, `rebuild-plan.md` |

## Verification results

- Lint: 0 errors (786 pre-existing warnings, unchanged count)
- TypeScript: 0 errors
- Tests: 109/109 pass
- Production build: passes (117 pages generated)
- Console errors: 0 at all 8 viewports (360/390/430/768/1024/1280/1440/1920)
- Horizontal overflow: none at any viewport
- Reduced motion: marquee/pulses off, counters jump to final value, no errors
- Interactions verified: date-range KPI change (8,492→32,180), chart tooltip,
  count-up (0→10M+), pricing 1,999↔2,499, FAQ open/close cycle, AI tab switch,
  mobile menu open

## Visual comparison passes (programmatic — vision API unavailable)

**Pass 1 — geometry vs reference (1440px):** H1 80px Geist both (163px vs 168px
tall); doc height 15,006 vs 16,264 (−8%); container narrowed 1280→1200px to
match reference measure; body copy 17px vs reference 16px.

**Pass 2 — responsive sweep:** fluid H1 42px@360 → 66.5px@1024 → 80px@1280+;
zero overflow, zero console errors at all 8 breakpoints.

**Pass 3 — interaction + final render:** all controls exercised; screenshots
saved (`.hermes/reference/indigo-*-final.png`).

## Honest remaining differences from the reference

1. **Vision-model pixel comparison not performed** — external vision API
   returned 503/404 throughout the session; comparison used computed-geometry
   + DOM probes instead. A pixel pass should be re-run when the API is healthy.
2. **Testimonial marquee is slower and lighter** than the reference's (two
   rows, CSS-driven) — no avatar images (original text-only cards, by design).
3. **Blog cards use typographic thumbnails** instead of photos (no external
   image assets; intentional).
4. **Hero dashboard is markup** (per the brief: "real interface markup, not
   only a static screenshot") — denser than the reference's static PNG by
   design, and interactive beyond it.
5. **Reference logo marquee uses real brand wordmarks** — ours uses generic
   genre wordmarks (authorized tools + fictional names, no external assets).
6. **Section numbering** is intentionally consistent `01–10` (the reference's
   `of 07`/`of 10` mix was flagged as a defect, not copied).
7. **Reference "Trusted by 5000+"** strip omitted — unsupported claim.
