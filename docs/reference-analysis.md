# Reference Analysis — cypon-analytics preview

Reconstructed from full-page screenshots at 1440/1280/1024/768/390 and the
clean-text extraction (20,482 chars). Visual language only — all product names,
copy, and assets are replaced with Indigo originals.

## Page structure (top → bottom)

1. Sticky translucent header (brand · 4 nav groups · GitHub-style star · CTA)
2. Hero: badge "Run Your Analytics 10x Faster" → two-line display heading →
   body → Request Demo / Join Waitlist → **large static dashboard image**
   (`dashboard-dark.png`) with atmospheric fade + grid behind it
3. Trust marquee: "Trusted by 5000+ Top companies" + 7 real wordmarks, looped
4. `[ 01 of 07 ]` Metrics — 4 stat cards (10M+ / 85% / 3x / 99.9%), bold value,
   small label, muted detail line
5. `[ 02 of 07 ]` Main Features — 2×3 bento with live mini-UIs: event stream
   (rows slide in), funnel (4 tapered bars), heatmap, dashboard builder,
   integrations, cohort (+12.4% badge). Each card: title, description, visual
6. `[ 03 of 10 ]` Integrations — tab filter (All 28 / DW 6 / Marketing 4 / …)
   + dense grid of 28 logo tiles; footer row "Don't see your tool?" + 2 CTAs
   (note the inconsistent `of 10`/`of 07` numbering — our rebuild must NOT copy)
7. `[ 03 of 07 ]` Use Cases — alternating rows: copy + mini dashboard (KPI
   strip, health table with LIVE badge), report scheduling card, attribution
   bars (+18.2%)
8. `[ 06 of 10 ]` Differentiators — 5 feature blocks with live visual states:
   streaming (events/s, latency), AI (accuracy, models), builder (drop zone),
   enterprise, performance (3x)
9. `[ 04 of 07 ]` Comparison — two-column table, Traditional vs Cypon, 5 rows,
   dim/light alternating
10. `[ 05 of 07 ]` Pricing — 3 cards, Growth highlighted "Most Popular",
    $0/$19/$79, annual toggle note "Billed yearly · 2 Months Free"
11. `[ 06 of 07 ]` Social proof — testimonial cards (likely grid/marquee)
12. Blog — 3 article cards with image thumbnails, category + date meta
13. `[ 08 of 08 ]` FAQs — 8-question accordion
14. Final CTA — heading + Request Demo / Join Waitlist over dotted-wave visual
15. Footer — multi-column

## Design tokens (from extraction + computed knowledge of the design family)

| Token | Reference |
|---|---|
| Canvas | near-black (zinc-950 family, ~#09090b) |
| Accent | indigo/violet family (#4f39f6-class) |
| Surface | elevated panels, translucent borders, minimal shadows |
| Type | Geist-style sans, display weights 500–600, tight tracking (-0.03em), sentence case |
| Section marker | `[ 01 of 07 ] · Label` uppercase small, muted |
| Eyebrow | small uppercase/overline above headline |
| Headline | two-line, clamp ~40–64px, balance wrap |
| Body | ~15–16px, muted, max-width ~560–640px |
| Container | ~1120–1200px centered |
| Section padding | ~96–120px vertical |
| Cards | 1px borders, 12–16px radius, hover border-lighten |
| Dashboard | full-width product frame with sidebar rail, KPI row, main chart, live badge |
| Bento | 12-col grid, lg spans (7/5, 5/7), sm 4-col |

## Interaction inventory (observed/presumed from markup)

- Header: dropdown mega menus (hover or click), star counter
- Integration tabs filter the grid
- Pricing annual/monthly toggle
- FAQ accordion expansion
- Testimonial marquee (dual-direction, pause on hover)
- Dashboard: static image in reference — our rebuild exceeds it with a real,
  interactive markup dashboard (allowed: "The dashboard should be real
  interface markup, not only a static screenshot")

## Motion inventory (presumed)

- Hero entrance stagger (headline → CTAs → dashboard rise)
- Section reveals (fade/rise on scroll into view)
- Event-stream rows cycling
- Metric count-up
- Marquee drift
- Hover border/bg shifts on cards and buttons

## Key proportions to match

- Hero ≈ 92–100vh visual mass (headline + large dashboard, not a tiny mockup)
- Dashboard ≈ 700–900px tall, full container width
- Metrics cards ≈ 1/4 width each
- Bento cards vary: 2 large (7-col) + 4 small
- Comparison rows ≈ 64–72px tall
- Footer ≈ 400px with 4–5 columns
