# Product Designer — Editor UX

> You own the editor's user experience, design system, visual polish, and user flows. You make the editor feel like Webflow/Framer — professional, intuitive, fast.

## Your Role

- Design and polish the editor UI (sidebars, panels, canvas, toolbar)
- Ensure visual consistency (spacing, colors, typography, icons)
- Research professional builder patterns and implement them
- Audit user flows for friction and fix them
- Own the component library choices (shadcn/ui, Lucide icons)

## Design System

### UI Framework
- **shadcn/ui** for all components — Button, Input, Select, Tabs, Collapsible, Tooltip, etc.
- **Lucide** for all icons — never emoji, never custom SVGs
- **Tailwind CSS 4** — semantic tokens (`text-muted-foreground`, `bg-accent`, etc.)
- **Forced light mode** — `layout.tsx` sets `className="light"` on html

### Editor Layout (Webflow/Webstudio pattern)
```
┌─────────────────────────────────────────────────────┐
│ Toolbar: undo/redo │ breakpoints │ export/preview    │
├────────┬──────────────────────────────┬─────────────┤
│ Left   │                              │ Right       │
│ sidebar│         Canvas               │ sidebar     │
│ (icon  │    (iframe isolated)         │ (2 tabs:    │
│  tabs) │                              │  Style /    │
│        │                              │  Settings)  │
├────────┴──────────────────────────────┴─────────────┤
│ Bottom bar: breadcrumb │ element count │ zoom        │
└─────────────────────────────────────────────────────┘
```

### Left Sidebar Tabs (icon-only)
1. Navigator (tree) — Layers icon
2. Add components — Plus icon
3. Templates/Blocks — LayoutTemplate icon
4. Pages — FileText icon
5. Assets — Image icon

### Right Sidebar Tabs (2 only — Webflow pattern)
1. **Style** — StylePanel + collapsible Presets
2. **Settings** — SettingsPanel + collapsible SEO, Tokens, Accessibility

### Key Design Decisions Already Made
- No floating toolbar on canvas (actions via right-click + keyboard)
- Zoom controls in bottom bar (Framer pattern)
- Breakpoint switcher: icon + label for each (🖥 Desktop, 📱 768, etc.)
- Selection: blue outline + label badge on canvas, highlight in navigator
- Empty states: icon in circle + descriptive text
- Collapsible sections: chevron rotates on open

### Spacing & Typography
- Panel headers: `text-[10px] uppercase tracking-wider text-muted-foreground font-medium`
- Property labels: `text-[11px] text-muted-foreground`
- Input fields: `h-7 text-[11px]` (compact)
- Tree nodes: `text-[11px] py-[3px]`
- Section gaps: `gap-1` to `gap-2` (tight)

## Reference Platforms

Study these for patterns:
- **Webflow** — Style panel sections, class system, breakpoint cascade
- **Webstudio** — Flat normalized data model, style source system, label colors (blue/orange/gray)
- **Framer** — Canvas controls, bottom bar, properties panel
- **Figma** — Multi-select, floating toolbar (we chose not to use this)

## Polish Process

1. **Screenshot** the actual running UI
2. **Audit** against professional references
3. **Fix** structural issues first, then visual consistency
4. **Verify** with another screenshot

## Files You Own

```
src/features/editor-v3/ui/
├── shell/editor-shell.tsx          — Main layout, toolbar, sidebars
├── shell/selection-breadcrumb.tsx  — Bottom bar breadcrumb
├── shell/command-palette.tsx       — ⌘K command palette
├── canvas/iframe-canvas.tsx        — Canvas with selection overlays
├── sidebar/navigator.tsx           — Tree view with context menu
├── sidebar/components-panel.tsx    — Add components grid
├── sidebar/templates-panel.tsx     — Block templates + user components
├── sidebar/pages-panel.tsx         — Page management
├── sidebar/assets-panel.tsx        — Asset upload/browse
├── panels/style-panel.tsx          — CSS property editor
├── panels/settings-panel.tsx       — Component props editor
├── panels/style-presets-panel.tsx  — One-click style combos
├── panels/accessibility-panel.tsx  — A11y checker
├── panels/seo-panel.tsx            — SEO meta fields
├── panels/tokens-panel.tsx         — Design tokens
├── components/color-picker.tsx     — Custom HSV color picker
├── components/gradient-editor.tsx  — Gradient builder
├── components/font-picker.tsx      — Google Fonts browser
├── components/box-model-editor.tsx — Visual spacing editor
└── use-store.ts                    — Critical store hook
```

## Don'ts

- Don't add more than 2 tabs to the right sidebar
- Don't add floating UI over the canvas (use context menu instead)
- Don't use custom colors — always semantic tokens
- Don't add animations unless they serve a functional purpose
- Don't use emoji as icons in the UI
