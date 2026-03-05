# Indigo Design System

> A strict, opinionated design system for the Indigo e-commerce dashboard.
> Inspired by Linear, Stripe, and Vercel Geist. Built on a 4px grid with OKLCH colors.

---

## 1. Spatial Foundation — 4px Base Grid

Every measurement in the UI must be a multiple of 4px. No exceptions.

### Spacing Scale (used for padding, margin, gap)

| Token    | Value | Tailwind | Usage |
|----------|-------|----------|-------|
| `space-0`  | 0px   | `0`      | Reset |
| `space-1`  | 4px   | `1`      | Tight inline gaps (icon-to-text inside buttons) |
| `space-2`  | 8px   | `2`      | Default inline gap, compact list item padding |
| `space-3`  | 12px  | `3`      | Card internal padding (compact), table cell padding |
| `space-4`  | 16px  | `4`      | Card internal padding (default), section gap |
| `space-5`  | 20px  | `5`      | Card internal padding (spacious) |
| `space-6`  | 24px  | `6`      | Section spacing, layout gap |
| `space-8`  | 32px  | `8`      | Page-level section spacing |
| `space-10` | 40px  | `10`     | Hero/marketing spacing only |
| `space-12` | 48px  | `12`     | Page top/bottom padding only |

### Rules
- Card padding: `p-4` (16px) — never `p-5`, `p-6`, or `p-8` inside cards
- Card gap (between header/content): `gap-3` (12px)
- Grid gap between cards: `gap-3` (12px)
- Section spacing (vertical between sections): `space-y-4` (16px)
- Layout padding: `p-4 md:p-6`
- List item padding: `px-3 py-2` (12px/8px)
- Table cell padding: `px-3 py-2.5` (12px/10px)

---

## 2. Component Heights — Unified Sizing

All interactive components share a height scale. This ensures buttons, inputs, selects, badges, and table rows align horizontally.

| Size   | Height | Tailwind | Usage |
|--------|--------|----------|-------|
| `xs`   | 24px   | `h-6`   | Inline badges, tiny icon buttons, tags |
| `sm`   | 32px   | `h-8`   | **Default for dashboard** — buttons, inputs, selects, table headers |
| `md`   | 36px   | `h-9`   | Icon containers in cards, avatar in lists |
| `lg`   | 40px   | `h-10`  | Primary CTAs on settings pages, hero buttons |

### Rules
- Dashboard buttons: always `size="sm"` (h-8, 32px) — never `default` (h-10)
- Inputs/selects in dashboard: `h-8` to match buttons
- Icon-only buttons: `size="icon-sm"` (h-8 w-8)
- Settings/modal primary actions: `size="default"` (h-10) is acceptable
- Never use `size="lg"` in the dashboard — reserved for marketing/onboarding

### Icon Container Scale

| Context              | Size    | Tailwind    | Radius       |
|----------------------|---------|-------------|--------------|
| Inside cards/alerts  | 36px    | `h-9 w-9`  | `rounded-lg` |
| Feed/list items      | 32px    | `h-8 w-8`  | `rounded-full` |
| Empty states         | 40px    | `h-10 w-10`| `rounded-xl` |
| Step indicators      | 24px    | `h-6 w-6`  | `rounded-full` |
| Inline with text     | 16px    | `h-4 w-4`  | none |

---

## 3. Typography — 5 Levels Only

The entire dashboard uses exactly 5 text sizes. No more.

| Role           | Size  | Weight     | Tracking      | Tailwind / Class | Usage |
|----------------|-------|------------|---------------|------------------|-------|
| Page title     | 20px  | 600        | -0.025em      | `text-xl font-semibold tracking-tight` | One per page, top-left |
| Stat value     | 28px  | 600        | -0.025em      | `.stat-value` | KPI numbers only |
| Section title  | 14px  | 600        | 0             | `text-sm font-semibold` | Card headers, table titles |
| Body           | 14px  | 400–500    | 0             | `text-sm` / `text-sm font-medium` | Default text, labels, descriptions |
| Caption        | 12px  | 500        | 0             | `text-xs text-muted-foreground` | Timestamps, secondary info, help text |

### Stat Label (special)
| Role       | Size | Weight | Tracking | Class |
|------------|------|--------|----------|-------|
| Stat label | 11px | 600    | 0.05em   | `.stat-label` (uppercase) |

### Rules
- `font-bold` is banned — use `font-semibold` (600) for emphasis
- `text-base` (16px) is banned in the dashboard — use `text-sm` (14px)
- `text-lg` (18px) is banned — use `text-sm font-semibold` for section titles
- `text-2xl` (24px) is banned for page titles — use `text-xl` (20px)
- `text-3xl`+ is banned entirely in the dashboard
- Page titles: `text-xl font-semibold tracking-tight` — never larger
- All numeric displays use `font-variant-numeric: tabular-nums`

---

## 4. Border Radius — 3 Values Only

| Token  | Value | Tailwind      | Usage |
|--------|-------|---------------|-------|
| `sm`   | 4px   | `rounded-sm`  | Badges, tags, inline code |
| `md`   | 6px   | `rounded-md`  | Buttons, inputs, selects, table cells |
| `lg`   | 8px   | `rounded-lg`  | Cards, dialogs, popovers, dropdowns |

### Rules
- `rounded-xl` (12px) is banned — use `rounded-lg`
- `rounded-2xl` (16px) is banned
- `rounded-full` is only for avatars, status dots, and circular icon buttons
- Cards: always `rounded-lg`
- Buttons: inherit from variant (default is `rounded-md`)
- Inputs: `rounded-md`

---

## 5. Color System

### Semantic Palette (from OKLCH tokens)

| Role        | Light                | Tailwind class |
|-------------|----------------------|----------------|
| Primary     | `--ds-blue-700`      | `text-primary`, `bg-primary` |
| Success     | `--ds-green-700`     | `text-success`, `bg-success` |
| Warning     | `--ds-amber-700`     | `text-warning`, `bg-warning` |
| Error       | `--ds-red-700`       | `text-error`, `bg-error` |
| Info        | `--ds-blue-700`      | `text-info`, `bg-info` |
| Brand       | `--ds-brand-700`     | `text-brand`, `bg-brand` |

### Tinted Backgrounds (for icon containers, badges)
Pattern: `bg-{semantic}/10` for 10% tint.
- `bg-success/10 text-success` — green icon container
- `bg-error/10 text-error` — red badge background
- Never use raw OKLCH values in components — always go through semantic tokens

### Surface Hierarchy
| Surface       | Usage | Class |
|---------------|-------|-------|
| Background    | Page background | `bg-background` |
| Card          | Cards, panels | `bg-card` |
| Muted         | Hover states, secondary surfaces | `bg-muted` |
| Muted/50      | Subtle hover | `bg-muted/50` |

---

## 6. Card Anatomy

Every card follows this exact structure:

```
┌─ Card (rounded-lg, ring-1 ring-foreground/10, py-0 gap-0) ─┐
│  ┌─ div.p-4 ──────────────────────────────────────────────┐ │
│  │  Section title (text-sm font-semibold)                  │ │
│  │  Content...                                             │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Rules
- Override Card's default `py-4 gap-4` with `py-0 gap-0`
- Use a plain `<div className="p-4">` instead of `<CardContent>` to avoid double padding
- Card border: built-in `ring-1 ring-foreground/10` — never add `border-border`
- No `shadow-*` on cards — the ring provides the boundary
- Card header: no `<CardHeader>` — just put the title inside the `p-4` div

---

## 7. Empty States

When data is zero or absent:

| Context | Treatment |
|---------|-----------|
| Metric card (value = 0) | Show `0` (not `₹0` for counts). Same `stat-value` size. |
| Chart (no data) | Show muted placeholder text: "No data yet" centered in chart area |
| Table (no rows) | Icon (h-10 w-10) + heading + description + optional CTA button |
| List (no items) | Same as table empty state |

---

## 8. Button Usage Rules

| Context | Variant | Size |
|---------|---------|------|
| Primary page action | `default` | `sm` |
| Secondary action | `outline` | `sm` |
| Destructive | `destructive` | `sm` |
| Table row action | `ghost` | `icon-sm` |
| Dialog confirm | `default` | `sm` |
| Dialog cancel | `outline` | `sm` |
| Settings page primary | `default` | `default` |

### Rules
- Dashboard buttons are always `size="sm"` unless in a settings form
- Icon buttons: `size="icon-sm"` (32×32) — never `size="icon"` (40×40) in dashboard
- Button text: `text-sm` (14px) — comes from the variant, don't override
- No custom height overrides like `className="h-7"` — use the size prop

---

## 9. Table Anatomy

```
┌─ Header row (bg-muted/50, text-xs font-medium uppercase tracking-wider) ─┐
│  px-3 py-2                                                                 │
├─ Data row (hover:bg-muted/50, border-b border-border/50) ────────────────┤
│  px-3 py-2.5, text-sm                                                      │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Banned Patterns

These patterns must never appear in dashboard code:

| Banned | Replacement |
|--------|-------------|
| `text-lg`, `text-xl` (for section titles) | `text-sm font-semibold` |
| `text-2xl`, `text-3xl` (for page titles) | `text-xl font-semibold tracking-tight` |
| `font-bold` | `font-semibold` |
| `p-6`, `p-8` inside cards | `p-4` |
| `gap-6` between cards | `gap-3` |
| `rounded-xl`, `rounded-2xl` | `rounded-lg` |
| `h-10 w-10` for list icons | `h-8 w-8` |
| `h-12 w-12` for card icons | `h-9 w-9` |
| `size="default"` buttons in dashboard | `size="sm"` |
| `size="lg"` buttons anywhere | `size="sm"` or `size="default"` |
| `border-border` on Cards | Remove (Card has built-in ring) |
| `shadow-sm`, `shadow-md` on Cards | Remove (use ring only) |
| Emoji in UI text | Use Lucide icons |
| `<CardContent>` with `<Card py-0>` | Plain `<div className="p-4">` |

---

## Implementation Checklist

When building or reviewing any dashboard page:

- [ ] Page title is `text-xl font-semibold tracking-tight`
- [ ] All section titles are `text-sm font-semibold`
- [ ] All stat values use `.stat-value` class
- [ ] All stat labels use `.stat-label` class
- [ ] All buttons are `size="sm"` (or `size="icon-sm"`)
- [ ] All cards use `py-0 gap-0` with `<div className="p-4">`
- [ ] No `rounded-xl` or `rounded-2xl` (use `rounded-lg`)
- [ ] No `text-lg`, `text-base`, `text-2xl` in dashboard
- [ ] No `font-bold` (use `font-semibold`)
- [ ] No `p-6` or `p-8` inside cards
- [ ] Grid gaps are `gap-3`
- [ ] Section spacing is `space-y-4`
- [ ] Icon containers follow the size scale
- [ ] Empty states follow the pattern
- [ ] No emoji in UI — use Lucide icons

---

## Interaction Patterns (Linear/Notion/Vercel-inspired)

### Command Palette (⌘K)
- Opens with `Cmd+K` / `Ctrl+K`
- Fuzzy search across all pages and actions
- Shows keyboard shortcut hints next to each item
- Groups: Quick Actions, Navigation

### Keyboard Shortcuts (Linear-style Go-To)
| Shortcut | Action |
|----------|--------|
| `⌘K` | Open command palette |
| `C` | Create new product |
| `G` then `D` | Go to Dashboard |
| `G` then `O` | Go to Orders |
| `G` then `P` | Go to Products |
| `G` then `C` | Go to Customers |
| `G` then `M` | Go to Marketing |
| `G` then `A` | Go to Analytics |
| `G` then `S` | Go to Settings |
| `G` then `I` | Go to Inventory |

Shortcuts are disabled when focus is in an input/textarea.

### Breadcrumbs
- Always visible in header (hidden on mobile)
- Shows full hierarchy: Dashboard > Section > Sub-page > Details
- Parent routes mapped for all sub-pages (e.g., Returns → Orders)

### Chart + Sentence Pattern
- Every chart has a one-line declarative summary below the title
- Example: "Revenue is up 12% compared to last period"
- Improves comprehension per NN/g research

### Empty States
- Use `EmptyState` component with `hint` prop for keyboard shortcuts
- Example: `hint="Press C to create your first product"`
- No decorative illustrations — functional, actionable content

### Page Header Template
- Use `<PageHeader>` component for all list pages
- Props: `title`, `description`, `count`, `actions`, `search`, `filters`
- Standardizes layout across Products, Orders, Customers, etc.

### Typography Additions
| Class | Size | Use |
|-------|------|-----|
| `.text-secondary-data` | 13px | Table cell secondary text, muted color |
| `.text-data-mono` | 13px | Tabular numbers for aligned data columns |
