# UI/UX Conventions

Rules for any UI code across dashboard and editor.

## Component Library

- shadcn/ui for all components. No custom component libraries.
- Lucide icons only. Use `MIcon` wrapper in editor (`ui/m-icon.tsx`).
- Tailwind CSS 4 classes. No inline styles except in editor canvas rendering.

## Design Tokens

- Compact: 10-11px labels, h-7 inputs, text-xs for panel content.
- Spacing: `gap-1` to `gap-3` in panels, `p-2` to `p-3` for panel padding.
- Borders: `border-sidebar-border` in editor panels, `border` in dashboard.

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

## Dashboard

- Server components for data fetching, client components for interactivity.
- Page headers: `text-xl font-semibold tracking-tight`.
- Empty states: icon (muted) + text + optional CTA.
- Lists: `rounded-lg border p-3/p-4` with `hover:bg-muted/50`.

## Accessibility

- All icon buttons need `aria-label` or wrapping `<Tooltip>`.
- Form inputs need associated labels (even if visually hidden).
- Keyboard navigation: focusable elements in logical order.
- No `outline: none` without alternative focus indicator.
