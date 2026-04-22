# Indigo Design System

> Based on Vercel's Geist design system (Mira style). Source of truth for all UI decisions.

## Foundation

- **Font**: Inter (--font-sans), Geist Mono (--font-mono)
- **Base**: 14px body, dark mode via CSS custom properties
- **Framework**: Tailwind CSS 4 + shadcn/ui (Mira style)
- **Icons**: Lucide only

## Typography

### Scale (from Geist + Mira CSS)

| Role | Class | Size | Weight | Usage |
|------|-------|------|--------|-------|
| Page title | `text-lg font-semibold tracking-tight` | 18px | 600 | Dashboard page headings |
| Card title | `text-sm font-medium` | 14px | 500 | Card headers, section titles |
| Body | `text-sm` | 14px | 400 | Primary body text |
| Dense body | `text-xs` | 12px | 400 | Tables, panels, secondary text |
| Label | `text-xs font-medium` | 12px | 500 | Form labels, menu items |
| Badge | `text-[10px]` | 10px | 500 | Badges, pills, status indicators |
| Shortcut | `text-[10px] tracking-widest` | 10px | 500 | Keyboard shortcuts |
| Numbers | + `tabular-nums` | — | — | All numeric displays |

### Rules
- `font-medium` (500) for labels and emphasis. `font-semibold` (600) for titles only.
- Never `font-bold` (700).
- `tracking-tight` on titles only. No custom tracking values.
- 13px is valid for secondary text (Geist Label 13 / Copy 13) but we use `text-xs` (12px) for simplicity.
- Strong modifier: use `<strong>` inside type classes, not separate weight classes.

## Colors

### Semantic Tokens (use these)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `background` | white | #0a0a0a | Page background |
| `foreground` | #171717 | #ededed | Primary text |
| `card` / `card-foreground` | white / dark | dark / light | Card surfaces |
| `muted` / `muted-foreground` | gray-100 / gray-800 | gray-200 / gray-800 | Secondary surfaces/text |
| `accent` / `accent-foreground` | gray-200 / dark | gray-200 / light | Hover states |
| `primary` / `primary-foreground` | gray-1000 / white | gray-1000 / gray-100 | Primary actions |
| `destructive` / `destructive-foreground` | red-700 / white | red-600 / gray-100 | Destructive actions |
| `success` / `success-foreground` | green-700 / white | green-700 / light | Success states |
| `warning` / `warning-foreground` | amber-700 / dark | amber-700 / light | Warning states |
| `info` / `info-foreground` | blue-700 / white | blue-700 / light | Info states |
| `border` | gray-200 | gray-200 | Borders |
| `input` | gray-300 | gray-300 | Input borders |
| `ring` | gray-1000 | gray-1000 | Focus rings |

### Geist Color Scales (10 steps each)
8 scales: gray, blue, red, amber, green, purple, pink, teal.

| Steps | Role | Example |
|-------|------|---------|
| 100–300 | Component backgrounds | `bg-success/10` for success tint |
| 400–600 | Borders | `border-warning/20` |
| 700–800 | Solid fills | `bg-primary` (buttons) |
| 900–1000 | Text & icons | `text-foreground` |

### Rules
- Semantic tokens only in components. Never hardcode hex, OKLCH, `bg-white`, `text-black`.
- Overlays: `bg-foreground/50` (not `bg-black/50`).
- White text on solid backgrounds: `text-primary-foreground` (not `text-white`).
- Status colors with opacity: `bg-success/10 text-success`, `bg-destructive/10 text-destructive`.

## Materials (Surfaces)

From Geist's 8-level material system:

| Surface | Radius | Border | Shadow | Usage |
|---------|--------|--------|--------|-------|
| **Base** | `rounded-lg` (8px) | `ring-1 ring-foreground/10` or `border` | none | Cards, containers |
| **Small** | `rounded-lg` | border | subtle 2px | Interactive cards |
| **Tooltip** | `rounded-md` (6px) | ring-1 | small | Tooltips |
| **Menu** | `rounded-lg` | ring-1 | `shadow-md` | Dropdowns, popovers |
| **Dialog** | `rounded-xl` (12px) | ring-1 | none | Modals, dialogs |
| **Fullscreen** | `rounded-xl` | ring-1 | large | Command palette, sheets |

### Rules
- Cards: `rounded-lg border` (we use CSS border, Geist uses ring — both work).
- No decorative shadows on cards. Shadows only on floating elements (menus, modals).
- Dialogs: `rounded-xl`. Everything else: `rounded-lg` or `rounded-md`.

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tight: icon groups |
| `gap-1.5` | 6px | Compact: badge content |
| `gap-2` | 8px | **Default**: most gaps |
| `gap-3` | 12px | Sections within a card |
| `gap-4` | 16px | Between cards/sections |
| `p-2` | 8px | Compact padding |
| `p-3` | 12px | Card content (compact) |
| `p-4` | 16px | **Default**: card content |
| `space-y-2` | 8px | Within sections |
| `space-y-4` | 16px | Between sections |
| `space-y-6` | 24px | Between page sections |

### Rules
- `gap-2` is the dominant spacer (555 uses).
- No `mr-2` on icons — parent `gap-*` handles spacing.
- Half-steps (1.5, 2.5, 3.5) are valid for fine-tuning.

## Heights

| Element | Height | Class |
|---------|--------|-------|
| Button default | 28px | `h-7` |
| Button sm | 24px | `h-6` |
| Button lg | 32px | `h-8` |
| Button xs | 20px | `h-5` |
| Icon button | 28px | `size-7` |
| Input (Mira) | 28px | `h-7` |
| Input (Indigo) | 36px | `h-9` |
| Select trigger | 28px | `h-7` |
| Table header | 40px | `h-10` |
| Sidebar menu | 32px | `h-8` |
| Tabs list | 32px | `h-8` |

> Note: Our inputs use `h-9` (36px) which is larger than Mira's `h-7` (28px). This is intentional for the Nepal market (touch-friendly).

## Icons

| Context | Size | Class |
|---------|------|-------|
| Inside buttons | 14px | `size-3.5` |
| Default standalone | 16px | `size-4` |
| Button sm icons | 12px | `size-3` |
| Button lg icons | 16px | `size-4` |
| Empty state | 32px | `size-8` |
| Placeholder | 20px | `size-5` |

### Rules
- Always `size-N`, never `h-N w-N`.
- Mira auto-sizes: `[&_svg:not([class*='size-'])]:size-3.5` on buttons.
- No `mr-2` — parent gap handles spacing.

## Components

### Button (from Mira CSS)
```
Variants: default, outline, secondary, ghost, destructive, link
Sizes: xs (h-5), sm (h-6), default (h-7), lg (h-8)
Icon sizes: icon-xs (size-5), icon-sm (size-6), icon (size-7), icon-lg (size-8)
Radius: rounded-md
Border: border-transparent (default), border-border (outline)
```

### Card (from Mira CSS)
```
Radius: rounded-lg
Border: ring-1 ring-foreground/10 (Mira) or border (Indigo)
Padding: py-4, px-4 content
Title: text-sm font-medium
Description: text-xs text-muted-foreground
```

### Input (from Mira CSS)
```
Height: h-7 (Mira) / h-9 (Indigo)
Radius: rounded-md
Background: bg-input/20 dark:bg-input/30
Border: border-input
Focus: focus-visible:border-ring focus-visible:ring-ring/30 ring-2
Error: aria-invalid:ring-destructive/20 ring-2
```

### Table (from Mira CSS)
```
Header height: h-10
Cell padding: p-2
Text: text-xs
Row hover: hover:bg-muted/50
Selected: data-[state=selected]:bg-muted
Header text: text-foreground font-medium
No Card wrapper — table sits directly on page
```

### Badge (from Mira CSS)
```
Height: h-5
Text: text-[0.625rem] (10px) font-medium
Radius: rounded-full
Padding: px-2 py-0.5
Variants: default, secondary, outline, destructive, ghost, link
```

### Empty State
```
Radius: rounded-xl border-dashed
Icon: size-8 in bg-muted rounded-md container
Title: text-sm font-medium tracking-tight
Description: text-xs
```

## Page Patterns

### List Page (Shopify/Linear/Stripe pattern)
```
Title                                    [Export] [+ Create]
[🔍 Search] [Filter ▾] [Sort ▾]
┌──────────────────────────────────────────────────┐
│ ☐  Name       Status     Date      Amount        │
│ ☐  Item 1     ● Active   Jan 1     $100          │
└──────────────────────────────────────────────────┘
                                        ← 1 2 3 →

Rules:
- No stat cards above tables
- No Card wrapper around tables
- Filters are a bare toolbar row
- Table has rounded-lg border
- Use EntityListPage primitive
```

### Settings Page
```
max-w-2xl space-y-6
├── Header: title + save button (⌘S shortcut)
├── Section: SectionHeader + rounded-lg border divide-y
│   └── ToggleRow / form fields (p-4)

Rules:
- Use SettingsPage primitive
- Use ToggleRow for switch rows
- Use SectionHeader for section titles
```

### Detail Page
```
← Back to [list]
Title                    [Status badge] [Actions ▾]
┌─────────────────────────────┐ ┌──────────────┐
│ Main content cards          │ │ Sidebar      │
│ (info, media, pricing...)   │ │ (org, seo)   │
└─────────────────────────────┘ └──────────────┘

Rules:
- Use EntityDetailPage primitive
- Use Savebar for unsaved changes
- Back button in header
```

## Primitives

| Primitive | Import | Purpose |
|-----------|--------|---------|
| `PageHeader` | `@/components/dashboard` | Title, subtitle, count, actions, search, filters |
| `SectionHeader` | `@/components/dashboard` | h2 with optional description |
| `SettingsPage` | `@/components/dashboard` | max-w-2xl + save header |
| `ToggleRow` | `@/components/dashboard` | Label + switch + badge |
| `StatBar` | `@/components/dashboard` | Metric cards grid (deprecated for list pages) |
| `EmptyState` | `@/components/ui/empty-state` | Icon + text + CTA |
| `EntityListPage` | `@/components/dashboard/templates` | Full list page template |
| `EntityDetailPage` | `@/components/dashboard/templates` | Detail page with sidebar |
| `Savebar` | `@/components/dashboard` | Floating save/discard bar |

## Animation

| Token | Value | Usage |
|-------|-------|-------|
| `duration-100` | 100ms | Micro: color changes, toggles |
| `duration-150` | 150ms | Default: hover states, tabs |
| `duration-200` | 200ms | Panels: dropdowns, tooltips |
| `transition-colors` | — | **Default** for hover states |
| `transition-opacity` | — | Show/hide elements |
| `animate-spin` | — | Loading spinners only |

### Rules
- No `transition-all` (performance). Use specific properties.
- No framer-motion in dashboard. Landing pages only.
- No decorative animations (stagger, flip, glow, number-tick).
- `animate-in`/`animate-out` for dialogs/dropdowns (shadcn default).

## Anti-Patterns (NEVER)

```
❌ mr-2 on icons (use parent gap)
❌ h-8 w-8 (use size-8)
❌ shadow-sm on cards (no decorative shadows)
❌ font-bold (use font-semibold)
❌ tracking-[-0.4px] (use tracking-tight)
❌ text-[9px] (minimum is text-[10px])
❌ text-[11px] or text-[13px] (use text-xs)
❌ bg-black/50 (use bg-foreground/50)
❌ text-white (use text-primary-foreground)
❌ rounded-xl on cards (use rounded-lg)
❌ transition-all (use transition-colors)
❌ Card wrapper around tables
❌ Stat cards above list pages
❌ Filters inside Card components
❌ MovingBorder, FlipWords, GlowingEffect, NumberTicker in dashboard
```
