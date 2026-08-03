# Indigo Landing Page — Design System & Section Reference

> Adapted from [payloadcms.com](https://payloadcms.com) live capture (Aug 2026).
> Typography: Outfit (closest free match to Payload's Untitled Sans).
> Colors: Exact Payload hex values from CSS custom properties.
> All styling uses Tailwind CSS 4 + custom `landing.css` utilities.

---

## Table of Contents

1. [Global Design Tokens](#global-design-tokens)
2. [Typography Scale](#typography-scale)
3. [Color Palette](#color-palette)
4. [Spacing & Layout](#spacing--layout)
5. [Animation Patterns](#animation-patterns)
6. [Section-by-Section Reference](#section-by-section-reference)
   - [1. AnnouncementBar](#1-announcementbar)
   - [2. Navbar](#2-navbar)
   - [3. Hero](#3-hero)
   - [4. SocialProof](#4-socialproof)
   - [5. HowItWorks](#5-howitworks)
   - [6. BentoGrid](#6-bentogrid)
   - [7. Infrastructure](#7-infrastructure)
   - [8. Metrics](#8-metrics)
   - [9. IntegrationsMarquee](#9-integrationsmarquee)
   - [10. SolutionsRoles](#10-solutionsroles)
   - [11. ComparisonRiver](#11-comparisonriver)
   - [12. Developers](#12-developers)
   - [13. Security](#13-security)
   - [14. Pricing](#14-pricing)
   - [15. Testimonials](#15-testimonials)
   - [16. BlogInsights](#16-bloginsights)
   - [17. Faq](#17-faq)
   - [18. CtaBanner](#18-ctabanner)
   - [19. Footer](#19-footer)
   - [20. ScrollToTop](#20-scrolltotop)

---

## Global Design Tokens

All tokens are scoped to `.landing-page` in `src/app/landing.css` to avoid leaking into the dashboard.

| Token | Value | Usage |
|---|---|---|
| `--background` | `#000000` | Page background |
| `--foreground` | `#ffffff` | Primary text |
| `--card` / `--secondary` | `#141414` / `#1a1a1a` | Card backgrounds, secondary surfaces |
| `--muted-foreground` | `#9a9a9a` | Secondary text, labels |
| `--border` | `#2f2f2f` | All borders and dividers |
| `--primary` | `#ffffff` | Primary button background |
| `--primary-foreground` | `#000000` | Primary button text |
| `--success` | `#007fae` | Positive indicators (Payload blue) |
| `--warning` | `#f4ac4f` | Caution indicators (Payload orange) |
| `--destructive` | `#ff876f` | Error/negative indicators (Payload coral) |

---

## Typography Scale

Utility classes defined in `landing.css` under `@layer utilities`:

| Class | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `font-payload-h1` | clamp(2.25rem, 5vw, 4rem) | 500 | 1.0 | -0.05em | Hero headline |
| `font-payload-h2` | clamp(1.75rem, 4vw, 3rem) | 500 | 1.0 | -0.05em | Section headlines |
| `font-payload-h3` | clamp(1.25rem, 2vw, 1.5rem) | 500 | 1.2 | -0.05em | Card titles, feature names |
| `font-payload-h6` | 13px | 400 | 1.4 | 0.25em | Section labels (uppercase) |
| `font-payload-body` | 18px | 400 | 1.4 | -0.04em | Body text, descriptions |
| `font-payload-body-lg` | 24px | 400 | 1.2 | -0.04em | Large body text |

**Font stack:** `var(--font-outfit), var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif`

---

## Color Palette

Captured from live `payloadcms.com` CSS custom properties:

### Base Grayscale (21 steps)
```
--payload-base-0:    #ffffff  (lightest)
--payload-base-50:   #f5f5f5
--payload-base-100:  #ebebeb
--payload-base-200:  #d0d0d0
--payload-base-300:  #b5b5b5
--payload-base-400:  #9a9a9a
--payload-base-500:  #808080
--payload-base-600:  #656565
--payload-base-700:  #4a4a4a
--payload-base-800:  #2f2f2f
--payload-base-900:  #141414
--payload-base-950:  #070707
--payload-base-1000: #000000  (darkest)
```

### Accent Colors
| Scale | Primary (500) | Light (50) | Dark (900) |
|---|---|---|---|
| Success (Blue) | `rgb(0,127,174)` | `rgb(229,242,247)` | `rgb(0,25,35)` |
| Warning (Orange) | `rgb(244,172,79)` | `rgb(254,247,237)` | `rgb(49,34,16)` |
| Error (Coral) | `rgb(255,135,111)` | `rgb(255,243,241)` | `rgb(51,27,22)` |
| Purple | `rgb(247,153,247)` | — | — |

---

## Spacing & Layout

| Pattern | Value | Tailwind |
|---|---|---|
| Max content width | 1280px | `max-w-7xl` |
| Horizontal padding | 24px → 48px | `px-6 lg:px-12` |
| Section vertical padding | 96px → 128px | `py-24 lg:py-32` |
| Grid gap (bordered grids) | 1px | `gap-px` |
| Card padding | 32px → 40px | `p-8 lg:p-10` |
| Border radius (containers) | 12px | `rounded-xl` |
| Border radius (buttons) | 8px | `rounded-lg` |

---

## Animation Patterns

All animations respect `prefers-reduced-motion: reduce`.

| Pattern | Class | Duration | Easing | Usage |
|---|---|---|---|---|
| Hero entrance | `hero-fade` | 0.9s | `cubic-bezier(0.2, 0.2, 0.2, 1)` | Staggered hero elements |
| Section reveal | `useInView` + Tailwind | 500ms | default | Scroll-triggered sections |
| Marquee | `marquee` / `marquee-reverse` | 30s / 25s | linear | Infinite horizontal scroll |
| Mask reveal | `mask-reveal` | 0.8s | `cubic-bezier(0.16, 1, 0.3, 1)` | Scroll-driven entrance |
| Shimmer | `shimmer` | 1.5s | ease-in-out | Loading skeletons |
| Pulse | `pulse-attention` | 2s | ease-in-out | Attention indicators |
| Hover lift | `hover-lift` | 0.4s | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Card hover effect |

---

## Section-by-Section Reference

### 1. AnnouncementBar

**File:** `src/components/landing/announcement-bar.tsx`

**Layout:** Single-row centered text bar, full-width, fixed height.

**Structure:**
```
┌─────────────────────────────────────────────────┐
│  Indigo is now in public beta  Learn More →  ✕  │
└─────────────────────────────────────────────────┘
```

**Design:**
- Background: `bg-background` (black)
- Border: `border-b border-border` (bottom only)
- Text: `font-payload-body text-sm`
- "Learn More" is a link with `ArrowRight` icon
- Close button (`X`) positioned absolute right
- Dismissible via `useState`

**Behavior:** Clicking `X` removes the bar from DOM.

---

### 2. Navbar

**File:** `src/components/landing/navbar.tsx`

**Layout:** Fixed header with logo, 5 nav triggers, and CTA group. Three dropdown panels open on hover.

**Desktop structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Indigo    Product  Solutions  Developers  Pricing  Docs   🔍   │
│                     [GitHub] [Login] [Get Started]               │
└──────────────────────────────────────────────────────────────────┘
```

**Scrolled state:** `bg-background/80 backdrop-blur-md border-b border-border`

**Dropdown panels (full-width, below header):**

#### Product Dropdown
```
┌──────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ 🏪 Headless CMS     │  │                     │               │
│  │ Content-first...    │  │   [Image Preview]   │               │
│  │ 🛒 eCommerce        │  │                     │               │
│  │ Full storefront...  │  │   Updates on hover  │               │
│  │ 🎨 Visual Editor    │  │                     │               │
│  │ Drag-and-drop...    │  └─────────────────────┘               │
│  │ 💳 Payments         │                                        │
│  │ eSewa, Khalti...    │                                        │
│  │ 📐 Multi-Tenant     │                                        │
│  │ One dashboard...    │                                        │
│  │ 📄 Custom Domains   │                                        │
│  │ Your brand...       │                                        │
│  └─────────────────────┘                                        │
└──────────────────────────────────────────────────────────────────┘
```
- 2-column icon link grid (left 7 cols) + image preview (right 5 cols)
- Sibling dimming: hovered item full opacity, others dim to 60%
- Image updates on hover via `hoveredIdx` state

#### Solutions Dropdown
```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ 🚀 For       │ │ 🏢 For       │ │ 🌍 For       │            │
│  │   Founders   │ │   Enterprise │ │   Global     │            │
│  │ Launch in    │ │ Scale        │ │ Multi-region │            │
│  │ a weekend    │ │ securely     │ │ ops          │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│  ──────────────────────────────────────────────────── (divider) │
│  [B] Blue Origin  [M] Microsoft  [N] Nike  [S] Stripe  ...     │
└──────────────────────────────────────────────────────────────────┘
```
- 3 gradient featured cards (top) with background photography effect
- Divider line
- 6-column company logo grid (bottom)

#### Developers Dropdown
```
┌──────────────────────────────────────────────────────────────────┐
│  Start Building          Resources          ┌──────────────────┐│
│  ┌────────────────────┐  ┌────────────────┐ │                  ││
│  │ > Quick Start      │  │ 📖 Docs        │ │  Terminal        ││
│  │ Get running in 5m  │  │ Guides and...  │ │  display         ││
│  │ > Templates        │  │ 🔗 Webhooks    │ │                  ││
│  │ Pre-built starters │  │ Real-time...   │ │  npx create-     ││
│  │ > Examples         │  │ 📚 Blog        │ │  indigo-app      ││
│  │ Reference impls    │  │ Tutorials...   │ │                  ││
│  └────────────────────┘  └────────────────┘ └──────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```
- 2-column link groups (left 7 cols) + featured image panel (right 5 cols)

**Mobile:** Sheet overlay with Radix Accordion sections, pinned CTA at bottom.

**Interactions:**
- Dropdown opens on hover with 100ms close delay
- Escape key closes dropdown
- Click outside closes dropdown
- Entrance: `animate-in fade-in slide-in-from-top-2 duration-200`

---

### 3. Hero

**File:** `src/components/landing/hero.tsx`

**Layout:** 12-column grid — 5 cols copy + 7 cols visual (MediaStack).

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│                     [Diagonal blue light streaks]                 │
│  ┌──────────────────┐  ┌─────────────────────────────────────┐  │
│  │                  │  │  ┌─────────────────────────────┐    │  │
│  │  The platform    │  │  │  Dashboard Mock (front)     │    │  │
│  │  to build the    │  │  │  ┌───┐ ┌───┐ ┌───┐         │    │  │
│  │  modern store.   │  │  │  │   │ │   │ │   │         │    │  │
│  │                  │  │  │  └───┘ └───┘ └───┘         │    │  │
│  │  Launch a        │  │  │  [Chart bars]              │    │  │
│  │  premium...      │  │  └─────────────────────────────┘    │  │
│  │                  │  │                                     │  │
│  │  [Start selling] │  │  ┌───────────────────┐             │  │
│  │  [Get a demo]    │  │  │ Storefront Mock   │             │  │
│  │                  │  │  │ (rear, offset)    │             │  │
│  │  $ npx create-   │  │  └───────────────────┘             │  │
│  │  indigo-app  📋  │  └─────────────────────────────────────┘  │
│  └──────────────────┘                                            │
└──────────────────────────────────────────────────────────────────┘
```

**Background:** Diagonal blue light streaks (linear-gradient with `#007fae`), noise overlay, fade-to-background gradient at bottom.

**Headline:** `font-payload-h1` (64px desktop, scales to 36px mobile), `leading-[0.95]`, `tracking-tight`.

**CTAs:** Two buttons — "Start selling" (primary, white bg) + "Get a demo" (outline).

**Terminal command:** `$ npx create-indigo-app` with copy-to-clipboard, `aria-live="polite"` feedback.

**MediaStack:** Two overlapping glassmorphic screenshot cards (StorefrontMock rear, DashboardMock front). Both use `glass-frame` class (backdrop-blur, semi-transparent bg, subtle border).

**Entrance:** Staggered `hero-fade` animations (0.1s → 0.7s delays).

---

### 4. SocialProof

**File:** `src/components/landing/social-proof.tsx`

**Layout:** Centered section with label + 4-column metrics grid.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  TRUSTED BY MERCHANTS WORLDWIDE                                  │
│                                                                  │
│  12,000+      $2.4B         99.99%       150+                   │
│  Stores       GMV Processed Uptime       Countries              │
└──────────────────────────────────────────────────────────────────┘
```

- Label: `font-payload-h6 text-muted-foreground`
- Values: `font-payload-h2 text-foreground`
- Labels: `font-payload-body text-muted-foreground`
- Scroll-triggered staggered reveal via `useInView`

---

### 5. HowItWorks

**File:** `src/components/landing/how-it-works.tsx`

**Layout:** Header + 3-column bordered grid.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  HOW IT WORKS                                                    │
│  From idea to live store                                         │
│                                                                  │
│  ┌──────────────────┬──────────────────┬──────────────────┐     │
│  │ 01               │ 02               │ 03               │     │
│  │ Design your      │ Add your         │ Start selling    │     │
│  │ storefront       │ products         │                  │     │
│  │                  │                  │                  │     │
│  │ Use the visual   │ Import or create │ Go live with     │     │
│  │ page builder...  │ your catalog...  │ payments...      │     │
│  └──────────────────┴──────────────────┴──────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

- Grid: `gap-px bg-border border border-border` (1px border lines between cells)
- Numbers: `font-payload-body text-muted-foreground`
- Titles: `font-payload-h3`
- Descriptions: `font-payload-body text-muted-foreground`
- Staggered entrance: 150ms delay per card

---

### 6. BentoGrid

**File:** `src/components/landing/bento-grid.tsx`

**Layout:** Header + 3×2 bordered feature grid.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  FEATURES                                                        │
│  Everything you need to sell online                              │
│                                                                  │
│  ┌──────────────────┬──────────────────┬──────────────────┐     │
│  │ Visual Page      │ Multi-Tenant     │ Payment          │     │
│  │ Builder          │ Architecture     │ Processing       │     │
│  │ Drag-and-drop... │ Each store is... │ eSewa, Khalti... │     │
│  ├──────────────────┼──────────────────┼──────────────────┤     │
│  │ Inventory        │ Analytics        │ Custom           │     │
│  │ Management       │ Dashboard        │ Domains          │     │
│  │ Real-time stock  │ Revenue, orders  │ Your brand, your │     │
│  │ tracking...      │ and insights...  │ domain...        │     │
│  └──────────────────┴──────────────────┴──────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

- Same bordered grid pattern as HowItWorks
- Titles translate right on hover (`group-hover:translate-x-1`)
- Cells: `hover:bg-secondary/50` transition

---

### 7. Infrastructure

**File:** `src/components/landing/infrastructure.tsx`

**Layout:** Header + asymmetric card grid (4+2+2+4 cols).

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  INFRASTRUCTURE                                                  │
│  Built for scale                                                 │
│  Our globally distributed edge network...                        │
│                                                                  │
│  ┌────────────────────────────────┬──────────────┐              │
│  │ 01                             │ 02           │              │
│  │ Edge Network                   │ Auto-scaling │              │
│  │ 200+ global PoPs...            │ Handle 100x  │              │
│  │                                │ traffic...   │              │
│  ├──────────────┬─────────────────┼──────────────┤              │
│  │ 03           │ 04                            │              │
│  │ 99.99%       │ Zero Code                     │              │
│  │ Uptime       │ Drag-and-drop...              │              │
│  │ SLA-backed   │                               │              │
│  └──────────────┴────────────────────────────────┘              │
└──────────────────────────────────────────────────────────────────┘
```

- Cards: `bg-secondary/50 border border-border rounded-xl`
- Numbers: `font-payload-body text-muted-foreground`
- Titles: `font-payload-h3`
- Descriptions: `font-payload-body` or `font-payload-body-lg`
- Staggered entrance: 150ms increments

---

### 8. Metrics

**File:** `src/components/landing/metrics.tsx`

**Layout:** Full-width bordered bar with 4-column centered metrics.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  42ms          99.99%        180ms         320+                  │
│  Avg TTFB      API Uptime    P95 Latency   CDN Edges            │
└──────────────────────────────────────────────────────────────────┘
```

- Section: `bg-background border-y border-border`
- Values: `font-payload-h2 text-foreground`
- Labels: `font-payload-h6 text-muted-foreground`
- Centered on mobile, left-aligned on desktop

---

### 9. IntegrationsMarquee

**File:** `src/components/landing/integrations-marquee.tsx`

**Layout:** Header + two counter-rotating marquee rows.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  INTEGRATIONS                                                    │
│  Works with everything you already use                           │
│                                                                  │
│  → eSewa │ Khalti │ Stripe │ Nabil Bank │ Pathao │ Nepal Post → │
│  ← Google Analytics │ Mailchimp │ Slack │ GitHub │ Figma ←      │
└──────────────────────────────────────────────────────────────────┘
```

- Top row: `marquee` (left-to-right, 30s)
- Bottom row: `marquee-reverse` (right-to-left, 25s)
- Cards: `border border-border bg-background rounded-lg`
- Hover: `hover:bg-secondary/50 hover-lift`
- Seamless loop: content duplicated, `translateX(-50%)` animation

---

### 10. SolutionsRoles

**File:** `src/components/landing/solutions-roles.tsx`

**Layout:** Header + stacked rows with icon, title, description.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  BUILT FOR                                                       │
│  Designed for modern commerce                                    │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│  [🚀] Founders                                                   │
│       Launch your store in a weekend...                          │
│  ──────────────────────────────────────────────────────────────  │
│  [💻] Developers                                                  │
│       API-first with webhooks, SDKs...                            │
│  ──────────────────────────────────────────────────────────────  │
│  [🎨] Designers                                                   │
│       Visual builder with full CSS control...                     │
│  ──────────────────────────────────────────────────────────────  │
│  [🏢] Enterprise                                                  │
│       Multi-store management, team roles...                       │
│  ──────────────────────────────────────────────────────────────  │
└──────────────────────────────────────────────────────────────────┘
```

- Rows separated by `border-t border-b border-border`
- Icon: `bg-secondary` → `bg-foreground text-background` on hover
- Titles: `font-payload-h3`
- Descriptions: `font-payload-body text-muted-foreground`
- 12-col grid: 2 (icon) + 4 (title) + 6 (description)

---

### 11. ComparisonRiver

**File:** `src/components/landing/comparison-river.tsx`

**Layout:** Header + bordered table grid (Feature / Traditional / Indigo).

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  WHY INDIGO                                                      │
│  The old way vs the new way                                      │
│                                                                  │
│  ┌────────────┬──────────────────────┬──────────────────────┐   │
│  │ FEATURE    │ TRADITIONAL          │ INDIGO               │   │
│  ├────────────┼──────────────────────┼──────────────────────┤   │
│  │ 🏪 Store   │ ✕ Single store per   │ ✓ Unlimited          │   │
│  │ Management │   account...         │   storefronts...     │   │
│  ├────────────┼──────────────────────┼──────────────────────┤   │
│  │ 💳 Payment │ ✕ Struggle with      │ ✓ Native support     │   │
│  │            │   local gateways...  │   for global...      │   │
│  ├────────────┼──────────────────────┼──────────────────────┤   │
│  │ ⚡ Perf    │ ✕ Bloated themes...  │ ✓ Lightning-fast     │   │
│  ├────────────┼──────────────────────┼──────────────────────┤   │
│  │ 🎨 Custom  │ ✕ Rigid templates... │ ✓ Component-driven   │   │
│  ├────────────┼──────────────────────┼──────────────────────┤   │
│  │ 🏷️ Pricing │ ✕ Hidden fees...     │ ✓ Transparent flat   │   │
│  └────────────┴──────────────────────┴──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

- Container: `border border-border` (no border-radius)
- Column headers: `bg-secondary/50`
- Alternating rows: `bg-background` / `bg-secondary/30`
- Traditional: `text-muted-foreground` with red `X` icon (`text-destructive`)
- Indigo: `text-foreground font-medium` with green check (`text-success`)
- Category column: icon + label with `bg-secondary` icon box
- Staggered entrance: 80ms per row

---

### 12. Developers

**File:** `src/components/landing/developers.tsx`

**Layout:** 2-column — left: header + feature list, right: code block.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  DEVELOPERS                                                      │
│  Built for developers                                            │
│                                                                  │
│  ── REST API ──────────────────  ┌────────────────────────────┐ │
│  Full programmatic access...     │ ● ● ●                      │ │
│  ── Webhooks ──────────────────  │ import { Indigo } from     │ │
│  React to events in real-time    │ '@indigo/sdk';             │ │
│  ── Custom Blocks ─────────────  │                            │ │
│  Build custom UI components...   │ const client = new Indigo({│ │
│                                  │   apiKey: process.env...   │ │
│                                  │ });                        │ │
│                                  │                            │ │
│                                  │ const product = await      │ │
│                                  │ client.products.create({   │ │
│                                  │   name: 'Indigo Tote Bag', │ │
│                                  │   price: 19900,            │ │
│                                  │ });                        │ │
│                                  └────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

- Left: `border-t border-border` dividers between features
- Right: dark code block (`bg-foreground text-background rounded-xl`) with offset shadow
- Window chrome: 3 dots + border
- Code: `font-mono text-sm`

---

### 13. Security

**File:** `src/components/landing/security.tsx`

**Layout:** Header + 2×2 bordered grid.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  SECURITY                                                        │
│  Bank-grade security                                             │
│                                                                  │
│  ┌──────────────────────────┬──────────────────────────┐        │
│  │ Tenant Isolation         │ End-to-End Encryption    │        │
│  │ Strict logical...        │ Data is encrypted...     │        │
│  ├──────────────────────────┼──────────────────────────┤        │
│  │ SOC 2 Compliant          │ PCI DSS Level 1          │        │
│  │ Audited annually...      │ Fully compliant...       │        │
│  └──────────────────────────┴──────────────────────────┘        │
└──────────────────────────────────────────────────────────────────┘
```

- Grid: `border-t border-l border-border` (outer), `border-b border-r` (cells)
- Titles: `font-payload-h3`
- Descriptions: `font-payload-body text-muted-foreground`
- Staggered entrance: 80ms per cell

---

### 14. Pricing

**File:** `src/components/landing/pricing.tsx`

**Layout:** Header + toggle + 3-column bordered pricing cards.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  PRICING                                                         │
│  Simple, transparent pricing                                     │
│                                                                  │
│  Monthly ○━━━━━━● Annual [Save 17%]                              │
│                                                                  │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ Starter      │ ★ Growth     │ Enterprise   │                 │
│  │ For new      │ For scaling  │ Custom       │                 │
│  │ merchants    │ businesses   │ solutions    │                 │
│  │              │              │              │                 │
│  │ $0/mo        │ $24/mo       │ Custom       │                 │
│  │              │              │              │                 │
│  │ [Get Started]│ [Start Trial]│ [Contact]    │                 │
│  │              │              │              │                 │
│  │ ✓ Up to 100  │ ✓ Unlimited  │ ✓ Everything │                 │
│  │   products   │   products   │   in Growth  │                 │
│  │ ✓ 1 store    │ ✓ 3 stores   │ ✓ Unlimited  │                 │
│  │ ✓ Community  │ ✓ Priority   │   stores     │                 │
│  │   support    │   support    │ ✓ 24/7       │                 │
│  │ ✓ Basic      │ ✓ Advanced   │   dedicated  │                 │
│  │   analytics  │   analytics  │   support    │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
│                                                                  │
│  All plans include secure hosting, unmetered bandwidth...        │
└──────────────────────────────────────────────────────────────────┘
```

- Grid: `gap-px bg-border border border-border`
- Growth card: elevated with `border-2 border-foreground` + "Popular" badge
- Toggle: custom switch with `bg-border` track, `bg-foreground` thumb
- Prices: `font-payload-h1 text-4xl`
- Plan names: `font-payload-h3`
- Features: `font-payload-body` with `Check` icon

---

### 15. Testimonials

**File:** `src/components/landing/testimonials.tsx`

**Layout:** 12-col grid — 8 cols quote + 4 cols metric card. Auto-rotating.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  WHAT MERCHANTS SAY                          01/04              │
│                                                                  │
│  ★★★★★                                                          │
│  "Indigo transformed our online presence.                        │
│   Sales doubled within three months."                            │
│                                                                  │
│  [P] Priya Sharma                                                │
│      Founder, Himalayan Crafts         ┌──────────────────────┐ │
│                                        │ KEY RESULT           │ │
│                                        │                      │ │
│                                        │ 2x revenue growth    │ │
│                                        │                      │ │
│                                        └──────────────────────┘ │
│                                        ●●○○ (progress dots)     │
└──────────────────────────────────────────────────────────────────┘
```

- Auto-rotates every 5 seconds
- Quote: `font-payload-h2`
- Author: `font-payload-body font-medium`
- Metric card: `border border-border bg-secondary/50 rounded-xl`
- Progress dots: clickable, active = `w-12 bg-foreground`, inactive = `w-4 bg-border`

---

### 16. BlogInsights

**File:** `src/components/landing/blog-insights.tsx`

**Layout:** Header + 3-column bordered article cards.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  INSIGHTS                          View all articles →          │
│  From the blog                                                   │
│                                                                  │
│  ┌──────────────┬──────────────┬──────────────┐                 │
│  │ [Strategy]   │ [Platform]   │ [Growth]     │                 │
│  │ Jul 18, 2026 │ Jul 02, 2026 │ Jun 14, 2026│                 │
│  │              │              │              │                 │
│  │ Optimizing   │ Announcing   │ How to build │                 │
│  │ checkout     │ native       │ a multi-     │                 │
│  │ flows...     │ integration  │ channel...   │                 │
│  │              │              │              │                 │
│  │ Learn how   │ We've partnered│ Discover the│                 │
│  │ reducing...  │ with top...  │ tools...     │                 │
│  │              │              │              │                 │
│  │ Read article │ Read article │ Read article │                 │
│  │ [→]          │ [→]          │ [→]          │                 │
│  └──────────────┴──────────────┴──────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
```

- Grid: `gap-px bg-border border border-border`
- Category badge: `font-payload-h6 border border-border rounded-full px-3 py-1`
- Titles: `font-payload-h3`
- "Read article" + arrow circle button

---

### 17. Faq

**File:** `src/components/landing/faq.tsx`

**Layout:** 12-col grid — 5 cols sticky header + 7 cols accordion.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  FAQ                                                             │
│  Common questions                             (sticky)           │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│  How long does it take to launch a store?              [−/+]    │
│  ──────────────────────────────────────────────────────────────  │
│  With our quick-start templates, you can launch...              │
│  ──────────────────────────────────────────────────────────────  │
│  Can I use my own domain?                            [−/+]    │
│  ──────────────────────────────────────────────────────────────  │
│  What payment gateways do you support?               [−/+]    │
│  ──────────────────────────────────────────────────────────────  │
│  Is there a transaction fee?                          [−/+]    │
│  ──────────────────────────────────────────────────────────────  │
│  Can I migrate from Shopify or WooCommerce?           [−/+]    │
│  ──────────────────────────────────────────────────────────────  │
│  Do you offer a free plan?                            [−/+]    │
│  ──────────────────────────────────────────────────────────────  │
└──────────────────────────────────────────────────────────────────┘
```

- Left column: `sticky top-32` headline
- Questions: `font-payload-h3`
- Answers: `font-payload-body text-muted-foreground`
- Accordion: `max-h-0 opacity-0` → `max-h-96 pb-5 opacity-100` transition
- Icons: `Plus` / `Minus` from Lucide

---

### 18. CtaBanner

**File:** `src/components/landing/cta-banner.tsx`

**Layout:** Centered text + buttons, full-width.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│          We're building a better way.                            │
│                                                                  │
│     Join thousands of forward-thinking merchants...              │
│                                                                  │
│     [Start your free trial]  [Talk to sales]                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

- Headline: `font-payload-h2`
- Subtext: `font-payload-body-lg text-muted-foreground max-w-2xl`
- Buttons: `Button` component (primary + outline)

---

### 19. Footer

**File:** `src/components/landing/footer.tsx`

**Layout:** 6-col grid — 2 cols brand + 4 cols link columns.

**Structure:**
```
┌──────────────────────────────────────────────────────────────────┐
│  Indigo                                                          │
│  The multi-tenant e-commerce platform...                         │
│  [Twitter] [GitHub] [LinkedIn]                                   │
│                                                                  │
│  PRODUCT         DEVELOPERS        COMPANY          LEGAL        │
│  Features        Documentation     About            Privacy      │
│  Pricing         API Reference     Blog             Terms        │
│  Integrations    Status            Careers [Hiring] Cookies      │
│  Changelog       GitHub            Contact          DPA          │
│                                                                  │
│  ──────────────────────────────────────────────────────────────  │
│  © 2026 Indigo. All rights reserved.    ● All systems operational│
└──────────────────────────────────────────────────────────────────┘
```

- Logo: `font-payload-h3`
- Column headers: `font-payload-h6 text-muted-foreground`
- Links: `font-payload-body text-muted-foreground hover:text-foreground`
- Bottom bar: `border-t border-border`
- Status dot: `bg-success` (green)

---

### 20. ScrollToTop

**File:** `src/components/landing/scroll-to-top.tsx`

**Layout:** Fixed button, bottom-right corner.

**Structure:**
```
                          ┌───┐
                          │ ↑ │
                          └───┘
```

- Appears after 400px scroll
- Button: `bg-secondary border border-border rounded-full p-3`
- Hover: `hover:bg-border hover:scale-110`
- Transition: `duration-300`
- Hidden when not visible: `opacity-0 translate-y-10 pointer-events-none`

---

## Component Dependencies

| Component | Imports |
|---|---|
| All sections | `useInView` from `@/hooks/use-in-view` |
| Navbar | `Sheet`, `SheetContent`, `SheetTrigger`, `SheetTitle` from `@/components/ui/sheet` |
| Navbar | `AccordionPrimitive` from `@radix-ui/react-accordion` |
| Hero, Pricing, CtaBanner | `Button` from `@/components/ui/button` |
| All sections | `cn` from `@/lib/utils` |
| Lucide icons | `ArrowRight`, `Check`, `X`, `Copy`, `Star`, `Menu`, `Search`, etc. |

---

## File Locations

```
src/components/landing/
├── announcement-bar.tsx
├── navbar.tsx              (mega-menu with 3 dropdown types)
├── hero.tsx                (MediaStack + terminal command)
├── social-proof.tsx        (metrics grid)
├── how-it-works.tsx        (3-step bordered grid)
├── bento-grid.tsx          (6-card feature grid)
├── infrastructure.tsx      (asymmetric card grid)
├── metrics.tsx             (full-width stat bar)
├── integrations-marquee.tsx(dual counter-rotating marquees)
├── solutions-roles.tsx     (stacked role rows)
├── comparison-river.tsx    (table-style comparison)
├── developers.tsx          (code block + features)
├── security.tsx            (2×2 bordered grid)
├── pricing.tsx             (3-tier toggle pricing)
├── testimonials.tsx        (auto-rotating quotes)
├── blog-insights.tsx       (3-column article cards)
├── faq.tsx                 (accordion + sticky header)
├── cta-banner.tsx          (centered CTA)
├── footer.tsx              (6-col link grid)
├── scroll-to-top.tsx       (fixed bottom-right button)
└── index.ts                (barrel exports)

src/app/
├── landing.css             (Payload tokens + utilities)
├── globals.css             (imports landing.css)
└── page.tsx                (composes all sections)
```