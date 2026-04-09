# Editor Design Spec — Shopify-Inspired

Based on deep research of Shopify's theme editor (March 2025 redesign) and Polaris design system.

## Shopify Theme Editor Layout (2025 Redesign)

### Key Architecture Change
- **Navigation moved to top bar** (was left sidebar)
- **Left panel = page structure** (sections tree)
- **Right panel = settings** for selected section/block
- **Double sidebar mode** (≥1600px): left = tree, right = settings
- **Single sidebar mode** (<1600px): stacked layout, settings slide up from bottom
- Right panel is **collapsible**

### Top Bar (Menu Bar)
Left: `[Sections] [Theme Settings] [App Embeds]` — toggle sidebar views
Center: `Theme Name (Live/Draft)` | `Market` | `Template`
Right: `Sidekick` | `Inspector` | `Mobile Preview` | `Undo/Redo` | `Save`

### Left Panel (Sidebar)
- Tree view of sections and blocks
- Each section: icon + name + expand/collapse + drag handle
- Blocks nested under sections
- "Add section" button at bottom
- Click section → right panel shows its settings

### Right Panel (Settings)
- Shows settings for the **currently selected** section or block
- When nothing selected: shows page-level info
- Settings are grouped into collapsible sections
- Each setting has: label, input, help text
- Inputs: text, textarea, color picker, image picker, select, range, checkbox

## Polaris Design Tokens (Light Theme)

### Colors
- **bg**: `#f1f1f1` (admin background)
- **bg-surface**: `#ffffff` (card/panel background)
- **bg-surface-secondary**: `#f7f7f7` (secondary surfaces)
- **bg-surface-selected**: `#f1f1f1`
- **bg-fill-brand**: `#303030` (primary buttons)
- **bg-fill-secondary**: `#f1f1f1` (secondary buttons)
- **bg-fill-emphasis**: `#005bd3` (focus/editor highlight — blue)
- **text**: `#303030`
- **text-secondary**: `#616161`
- **text-disabled**: `#b5b5b5`
- **text-emphasis**: `#005bd3` (blue, for editor focus)
- **border**: `#e3e3e3`
- **border-secondary**: `#ebebeb` (dividers)
- **border-emphasis**: `#005bd3` (selected element border — blue)
- **icon**: `#4a4a4a`
- **icon-secondary**: `#8a8a8a`

### Typography
- Font: **Inter** (Polaris v12+)
- Body: 13px / 20px
- Small: 12px / 16px
- Heading: 13px / 20px, font-weight 650
- Caption: 12px / 16px, color text-secondary

### Spacing
- 4px base unit
- Common: 4, 8, 12, 16, 20, 24, 32

### Border Radius
- Small: 8px
- Medium: 12px
- Large: 16px

### Shadows
- Card: `0 1px 0 0 rgba(0,0,0,0.05)`
- Popover: `0 4px 8px -2px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06)`

## What Makes Shopify's Editor Feel Professional

1. **Light theme** — NOT dark. Clean white panels, light gray background.
2. **Consistent 13px body text** — everything readable, nothing tiny
3. **Blue accent for selection** — `#005bd3` for selected borders, focus rings
4. **Generous spacing** — 16px padding in panels, 8px between items
5. **Subtle borders** — `#e3e3e3`, not harsh
6. **No visual noise** — minimal icons, no gradients, no shadows on panels
7. **Settings are inline** — no modals for basic settings
8. **Immediate preview** — changes reflect instantly in canvas
9. **Collapsible sections** — settings grouped logically, not all visible at once
10. **Consistent input styling** — all inputs look the same, same height, same border
