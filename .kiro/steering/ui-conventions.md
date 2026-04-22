# UI/UX Conventions

Rules for any UI code across dashboard, editor, and storefront. All agents must follow these.

## Component Library

- shadcn/ui for all components. No custom component libraries.
- Lucide icons only. `MIcon` wrapper in editor only.
- Tailwind CSS 4 classes. No inline styles except editor canvas rendering.

## Design Tokens

### Typography
- **Titles**: `text-lg font-semibold tracking-tight`
- **Body**: `text-sm` (dominant), `text-xs` for secondary
- **Labels/badges**: `text-[10px]` for tiny badges only, never `text-[9px]`
- **Weights**: `font-medium` (default), `font-semibold` (emphasis). Never `font-bold`.
- **Tracking**: `tracking-tight` only. Never `tracking-[-0.4px]` or `tracking-[-0.96px]`.
- **Numbers**: `tabular-nums` on all numeric displays

### Spacing
- `gap-2` is the dominant spacer
- `space-y-4` between sections, `space-y-2` within sections
- `p-4` for card content, `p-3` for compact areas
- No `mr-2` on icons — parent `gap-*` handles spacing

### Border Radius
- **Containers/cards/dialogs**: `rounded-lg` (8px)
- **Buttons/inputs**: `rounded-md` (6px) — shadcn default
- **Avatars/pills/badges**: `rounded-full`
- Never: `rounded-xl`, `rounded-2xl`, bare `rounded` on containers

### Shadows
- No decorative shadows (`shadow-sm/md/lg/2xl`) on cards or containers
- Card component has shadow removed globally in `card.tsx`
- Shadows only on popovers, dropdowns, command palette (shadcn defaults)

### Icons
- `size-3.5` inside buttons (with Loader2 spinners too)
- `size-4` default standalone
- `size-8` for empty state / placeholder icons
- Always `size-N`, never `h-N w-N` for square elements

### Heights
- `h-9` — shadcn default (buttons, inputs)
- `h-10` — headers, larger inputs
- `h-7` — compact buttons (`size="sm"`)
- Never `h-11` (non-standard)

### Colors
- Semantic tokens only: `bg-background`, `text-foreground`, `bg-muted`, `text-muted-foreground`
- Status: `text-success`, `text-destructive`, `text-warning`, `text-info`
- Overlays: `bg-foreground/50` (not `bg-black/50`), `text-primary-foreground` (not `text-white`)
- Never hardcode hex, OKLCH, `bg-white`, `bg-black`, `text-white`, `text-black`

### Animation
- No framer-motion / motion in dashboard pages
- `transition-colors` for hover states (not `transition-all`)
- `duration-150` for micro-interactions, `duration-200` for panels
- `animate-spin` on Loader2 only
- Landing pages and editor may use motion libraries

## Dashboard Patterns

### Page Layout
- Server components for data, client for interactivity
- Page headers: `text-lg font-semibold tracking-tight`
- Empty states: muted icon + text + optional CTA

### Settings Pages (all 9 follow this)
```
max-w-2xl space-y-6
├── Header: title + save button
├── Section: h2 text-sm font-medium mb-3
│   └── rounded-lg border divide-y
│       └── ToggleRow / form fields (p-4)
```

### List Pages
- `rounded-lg border` table container
- `hover:bg-muted/50` on rows
- Checkbox: shadcn `<Checkbox>`, never custom div
- Bulk actions: floating bottom bar (toast-style)

### Detail Pages
- `EntityDetailPage` template with sidebar
- `Savebar` for unsaved changes
- Back button + title in header

## Editor Overlays

| Handle | Color |
|--------|-------|
| Selection/resize | blue-500 |
| Hover | blue-400/40 |
| Drop target | emerald-500 |
| Padding | emerald-500 |
| Margin | orange-500 |
| Radius | amber-500 |
| Font-size | violet-500 |
| Snap lines | blue-500 |

## Accessibility

- All icon buttons need `aria-label` or wrapping `<Tooltip>`
- Form inputs need associated labels (even if visually hidden)
- Keyboard navigation: focusable elements in logical order
- No `outline: none` without alternative focus indicator
- Minimum text size: `text-[10px]` (never smaller)
- Color contrast: never convey meaning by color alone

## Anti-Patterns (NEVER do these)

- `mr-2` on icons inside buttons (use parent gap)
- `h-8 w-8` instead of `size-8`
- `shadow-sm` on Card components
- `font-bold` (use `font-semibold`)
- `tracking-[-0.4px]` (use `tracking-tight`)
- `text-[9px]` (too small, use `text-[10px]`)
- `text-[11px]` or `text-[13px]` (use `text-xs`)
- `bg-black/50` (use `bg-foreground/50`)
- `text-white` (use `text-primary-foreground`)
- `rounded-xl` on cards (use `rounded-lg`)
- `transition-all` (use specific: `transition-colors`, `transition-opacity`)
- MovingBorder, FlipWords, GlowingEffect, NumberTicker on dashboard
- StaggerGroup/StaggerItem wrapping dashboard content

## Design Skills Reference

When building or reviewing UI, these skills are available in `.kiro/skills/`:

| Task | Skill | When |
|------|-------|------|
| Evaluate quality | `/critique` | Before any redesign |
| Plan a feature | `/shape` | Before coding UI |
| Strip complexity | `/distill` | Too many elements |
| Reduce intensity | `/quieter` | Too bold/animated |
| Fix typography | `/typeset` | Sizing/weight issues |
| Add color | `/colorize` | Too monochromatic |
| Fix spacing | `/layout` | Rhythm/hierarchy off |
| Fix copy | `/clarify` | Confusing labels |
| Final pass | `/polish` | Pre-ship consistency |
| Tech audit | `/audit` | A11y/perf/theming |
