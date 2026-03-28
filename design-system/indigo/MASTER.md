# Indigo Design System — Master File

> When building a specific page, check `design-system/indigo/pages/[page-name].md` first.
> If that file exists, its rules **override** this Master. Otherwise, follow the rules below.

**Project:** Indigo — Multi-tenant e-commerce SaaS for Nepal
**Stack:** Next.js 16, Tailwind CSS v4, shadcn/ui (radix-mira style), Lucide icons
**Style:** Geist/Vercel-inspired flat design. Achromatic neutral base, semantic color only.

---

## Color System

Indigo uses CSS custom properties with light/dark mode via `prefers-color-scheme`.
No brand hue — brand IS the gray scale. Color comes only from semantic scales.

### Core Tokens (use these in components)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `bg-background` | `hsl(0 0% 100%)` | `#0a0a0a` | Page background |
| `bg-foreground` / `text-foreground` | `hsl(0 0% 9%)` | `#ededed` | Primary text |
| `bg-card` | `hsl(0 0% 100%)` | `#1a1a1a` | Card surfaces |
| `bg-muted` | `hsl(0 0% 95%)` | `#1f1f1f` | Subtle backgrounds |
| `text-muted-foreground` | `hsl(0 0% 66%)` | `#878787` | Secondary text |
| `bg-primary` | `hsl(0 0% 9%)` | `#ededed` | Buttons, active states |
| `border-border` | `hsl(0 0% 92%)` | `#1f1f1f` | Borders, dividers |
| `bg-destructive` | red-700 | red-600 | Delete, errors |

### Semantic Colors

| Role | Token | Light value | Dark value |
|------|-------|-------------|------------|
| Success | `text-success` | `ds-green-700` | `ds-green-700` |
| Warning | `text-warning` | `ds-amber-700` | `ds-amber-700` |
| Info | `text-info` | `ds-blue-700` | `ds-blue-700` |
| Destructive | `text-destructive` | `ds-red-700` | `ds-red-600` |

### Color Scales (for data viz, badges, status indicators)

Use `ds-{color}-{weight}` where color is: `blue`, `red`, `amber`, `green`, `purple`, `pink`, `teal`.
Weight range: 100 (lightest) → 1000 (darkest in light mode, lightest in dark mode — they invert).

### Chart Colors (oklch-based, perceptually uniform)

| Token | Light | Dark |
|-------|-------|------|
| `chart-1` | `oklch(0.65 0.18 25)` | `oklch(0.72 0.18 25)` |
| `chart-2` | `oklch(0.65 0.15 230)` | `oklch(0.72 0.15 230)` |
| `chart-3` | `oklch(0.65 0.15 155)` | `oklch(0.72 0.15 155)` |
| `chart-4` | `oklch(0.65 0.15 55)` | `oklch(0.72 0.15 55)` |
| `chart-5` | `oklch(0.65 0.12 300)` | `oklch(0.72 0.12 300)` |

---

## Typography

| Role | Font | Tailwind class |
|------|------|----------------|
| Sans (body, UI) | Inter → system stack | `font-sans` |
| Mono (code, data) | Geist Mono → system mono | `font-mono` |

No custom Google Fonts. System font stack for performance.

### Scale

| Usage | Size | Weight | Tracking |
|-------|------|--------|----------|
| Page title | `text-xl` (20px) | `font-semibold` (600) | `tracking-[-0.4px]` |
| Section heading | `text-lg` (18px) | `font-semibold` (600) | — |
| Body | `text-sm` (14px) | `font-normal` (400) | — |
| Caption / label | `text-xs` (12px) | `font-medium` (500) | `tracking-wider` (uppercase labels) |
| Badge text | `text-[10px]` | `font-medium` (500) | — |

### Rules
- Body text minimum 14px (dashboard context, not marketing)
- Line height: default Tailwind (1.5 for body)
- Max line length: not enforced in dashboard (tables/data need full width)

---

## Spacing & Layout

Uses Tailwind's default 4px base unit. No custom spacing tokens needed.

| Usage | Value | Tailwind |
|-------|-------|----------|
| Tight gaps (icon-text) | 4px | `gap-1` |
| Inline spacing | 8px | `gap-2`, `px-2` |
| Standard padding | 12-16px | `p-3`, `p-4` |
| Section padding | 16-24px | `p-4`, `p-6` |
| Page margin | 16-24px | `p-4 lg:p-6` |
| Between sections | 16px | `space-y-4` |

---

## Border Radius

Base: `0.625rem` (10px). Mira style.

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 6px | Small badges, chips |
| `rounded-md` | 8px | Inputs, buttons |
| `rounded-lg` | 10px | Cards, dialogs |
| `rounded-xl` | 14px | Large cards, modals |

---

## Shadows

Minimal. Flat design — shadows used sparingly.

| Usage | Class | When |
|-------|-------|------|
| Cards | No shadow by default | Flat on background |
| Dropdowns/popovers | `shadow-md` | Floating elements |
| Modals | `shadow-lg` | Overlay dialogs |
| Hover lift | Not used | Avoid — causes layout shift |

---

## Transitions & Animation

| Usage | Duration | Easing |
|-------|----------|--------|
| Color/opacity hover | `150ms` | `ease` |
| Expand/collapse | `200ms` | `ease-out` |
| Page transitions | `200ms` | `ease-out` |
| Loading spinners | `animate-spin` | — |
| Skeleton pulse | `animate-pulse` | — |

### Rules
- `duration-150` for micro-interactions (hover, focus)
- `duration-200` for structural changes (collapse, accordion)
- Always respect `prefers-reduced-motion` — use `motion-reduce:transform-none`
- No decorative animations (bouncing icons, floating elements)
- Active press: `active:scale-[0.98]` with `motion-reduce:transform-none`

---

## Component Patterns

### Buttons
- Primary: `bg-primary text-primary-foreground` (black in light, white in dark)
- Secondary: `bg-secondary text-secondary-foreground`
- Destructive: `bg-destructive text-white`
- Ghost: `hover:bg-muted`
- Always: `cursor-pointer`, visible focus ring, disabled state during async

### Cards
- `bg-card border border-border rounded-lg`
- No shadow by default
- No hover lift (flat design)
- Clickable cards: add `cursor-pointer` and `hover:bg-muted` transition

### Inputs
- `border-input rounded-md`
- Focus: `ring-2 ring-ring` (uses gray-1000 ring)
- 16px minimum font size on mobile (prevents iOS zoom)

### Data Tables
- `overflow-x-auto` wrapper for mobile
- Row hover: `hover:bg-muted`
- Sticky header when scrollable
- Tabular nums for numeric columns: `font-mono tabular-nums`

### Badges
- `text-[10px] px-1.5 py-0 h-4` or `h-5`
- Semantic: warning uses `bg-warning/70 text-white`
- Neutral: `bg-muted text-muted-foreground`

---

## Icons

- Library: **Lucide** exclusively (already in project)
- Size: `h-4 w-4` (16px) for inline, `h-5 w-5` (20px) for standalone
- No emojis as icons — ever
- Icon-only buttons must have `aria-label`

---

## Accessibility Checklist

- [ ] Color contrast 4.5:1 minimum for text
- [ ] Visible focus rings on all interactive elements (`focus-visible:ring-2`)
- [ ] `aria-label` on icon-only buttons
- [ ] Tab order matches visual order
- [ ] `prefers-reduced-motion` respected
- [ ] Form inputs have associated labels
- [ ] Touch targets minimum 44x44px on mobile
- [ ] No horizontal scroll on mobile (375px minimum)
- [ ] Skip link for keyboard navigation (dashboard has sidebar)
- [ ] Loading states: skeleton or spinner for operations >300ms

---

## Anti-Patterns (Do NOT Use)

- ❌ Emojis as icons
- ❌ `outline-none` without replacement focus indicator
- ❌ `scale` transforms on hover that shift layout
- ❌ Custom scrollbars (except code editors)
- ❌ Glassmorphism / backdrop-blur on content areas (performance)
- ❌ Gradients on buttons or cards (flat design)
- ❌ `animate-bounce` or decorative infinite animations
- ❌ Low contrast muted text (gray-400 on white = 2.8:1, too low)
- ❌ Instant state changes without transitions
- ❌ Dark mode as default (respect system preference)

---

## Dashboard-Specific Rules

### Sidebar
- 7 items, flat list, no group labels
- Settings pinned at bottom with `mt-auto`
- Collapsible to icon-only mode
- Keyboard shortcuts: `g+{key}` for navigation, `Cmd+K` for command palette

### Section Tabs
- Max 5 tabs per section (prevents mobile overflow)
- Active indicator: `h-0.5 bg-foreground` bottom bar
- First tab: exact URL match only

### Page Headers
- Title: `text-xl font-semibold tracking-[-0.4px]`
- Description: `text-muted-foreground` below title
- Actions: right-aligned on desktop, full-width on mobile

### Empty States
- Centered illustration/icon + heading + description + CTA
- Use `text-muted-foreground` for description
