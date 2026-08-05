# Indigo Landing V2

The marketing landing page rebuild, following the Cypon Analytics dark-analytics
design language (zinc-950 canvas, indigo-600 `#4f39f6` accent, Geist type).

## Installation & development

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm lint
pnpm test:run
pnpm run build      # production build
pnpm start          # serve the production build
```

## Architecture

```
src/app/page.tsx                      # route entry: metadata, JSON-LD, font vars, CSS import
src/app/landing-v2.css                # full design system (tokens, sections, responsive)
src/components/landing-v2/
  landing-v2-page.tsx                 # section orchestration (Server Component shell)
  header.tsx / mega-menu.tsx / mobile-menu.tsx   # sticky nav + accessible menus
  hero.tsx / dashboard-preview.tsx    # hero + original dashboard mockup
  logo-marquee.tsx / marquee.tsx      # CSS marquee (reduced-motion safe)
  section-heading.tsx / badge.tsx     # [ xx of xx ] · Label pattern + status badges
  metrics.tsx / features.tsx / integrations.tsx / use-cases.tsx
  differentiators.tsx / comparison.tsx / pricing.tsx / testimonials.tsx
  blog.tsx / faq.tsx / final-cta.tsx / footer.tsx
src/data/landing/
  section-data.ts                     # typed content for all numbered sections
  navigation.ts                       # mega-menu + mobile-menu content
  hero.ts / core.ts                   # hero copy and health-table data
```

## Content customization

All section copy lives in `src/data/landing/*`. Editable items:

- Metrics values, labels, and disclaimers — `section-data.ts → metrics`
- Integration catalog and categories — `section-data.ts → integrations`
- Pricing plans (NPR) and billing notes — `section-data.ts → pricing`
- Testimonials, blog posts, FAQ items — `section-data.ts`
- Hero headline/CTAs — `hero.ts`; nav links — `navigation.ts`

Sample values are intentionally conservative (marked "sample"/"target" in copy);
replace them with verified production numbers before launch.

## Theme customization

All colors, radii, spacing, and type scale live as CSS custom properties on
`.lv2-page` in `landing-v2.css`. To change the accent globally:

```css
--lv2-accent: #4f39f6;        /* primary */
--lv2-accent-hover: #432dd7;  /* hover */
--lv2-highlight: #7d87ff;     /* light accent for markers/charts */
```

Surfaces: `--lv2-bg` (canvas), `--lv2-panel` / `--lv2-panel-2` / `--lv2-panel-3`.
Type is Geist via `next/font` (`--font-indigo-sans` / `--font-indigo-mono`).

## Component overview

| Component | Behavior |
|---|---|
| `MegaMenu` | Click-open, Escape/outside-close, keyboard focus, no hover gap |
| `MobileMenu` | Accordion groups, body scroll lock, 44px targets |
| `Marquee` | Seamless loop, edge masks, pause on hover/focus, reduced-motion off |
| `SectionHeading` | Numbered `[ xx of xx ] · Label`, eyebrow, headline, body |
| `PricingSection` | Monthly/annual toggle with animated price swap |
| `IntegrationsSection` | Category tabs with live filtering |
| `FaqSection` | Accessible accordion with ARIA + rotated plus icon |
| `Footer` | Newsletter form with inline validation and success state |

## Accessibility & performance

- One `h1`, logical heading order, skip-to-content, visible focus rings
- `prefers-reduced-motion` disables marquees, pulses, and reveals
- Zero console errors; no horizontal overflow at 390px
- No external images, fonts, or heavy chart libraries on the landing
