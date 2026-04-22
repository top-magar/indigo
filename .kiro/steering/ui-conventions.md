# UI/UX Conventions

> Full reference: `docs/design-system.md` (298 lines, based on Vercel Geist / Mira style)

## Quick Rules

- shadcn/ui + Lucide icons + Tailwind CSS 4
- `text-lg font-semibold tracking-tight` for page titles
- `text-sm` body, `text-xs` secondary, `text-[10px]` badges
- `font-medium` default, `font-semibold` titles only, never `font-bold`
- `rounded-lg` containers, `rounded-md` buttons/inputs, `rounded-xl` dialogs
- `size-N` not `h-N w-N`, no `mr-2` on icons
- No decorative shadows, no framer-motion in dashboard
- Semantic colors only — no hardcoded hex/black/white
- No Card wrappers around tables, no stat cards above list pages
- `transition-colors` not `transition-all`

## Primitives (use these, don't reinvent)

`PageHeader`, `SectionHeader`, `SettingsPage`, `ToggleRow`, `StatBar`, `EmptyState`, `EntityListPage`, `EntityDetailPage`, `Savebar` — all from `@/components/dashboard`

## Page Patterns

**List**: Title + toolbar + bare table (Shopify/Linear pattern)
**Settings**: `max-w-2xl` + save header + `divide-y` sections (⌘S shortcut)
**Detail**: Back button + sidebar layout + Savebar

## Editor Overlays

| Handle | Color |
|--------|-------|
| Selection/resize | blue-500 |
| Hover | blue-400/40 |
| Drop target | emerald-500 |
| Padding | emerald-500, Margin | orange-500 |
| Radius | amber-500, Font-size | violet-500 |

## Design Skills

| Task | Skill |
|------|-------|
| Evaluate | `/critique` |
| Simplify | `/distill` |
| Reduce intensity | `/quieter` |
| Fix typography | `/typeset` |
| Fix spacing | `/layout` |
| Final pass | `/polish` |
| Tech audit | `/audit` |
