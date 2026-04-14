# Editor V3 — Knowledge Base

## Overview
Visual website editor within the Indigo multi-tenant e-commerce SaaS platform. Follows Webstudio's flat normalized data model with a 3-layer style system, iframe-isolated canvas, and full publishing pipeline.

**Stats**: 96 files, 7,093 lines, 22 components, 0 TS errors
**Branch**: `editor/core-plugin-api`

## Architecture

### Data Model (Webstudio-inspired flat normalized)
- **Instances**: `Map<InstanceId, Instance>` — component tree nodes with children (id refs or text)
- **Props**: `Map<PropId, Prop>` — key-value pairs linked to instances
- **StyleSources**: `Map<StyleSourceId, StyleSource>` — "local" (per-instance) or "token" (reusable, named)
- **StyleSourceSelections**: `Map<InstanceId, { values: StyleSourceId[] }>` — links instances to style sources
- **StyleDeclarations**: `Map<key, StyleDeclaration>` — CSS property + value per styleSource + breakpoint + state
- **Breakpoints**: Desktop (base), Tablet (768), Mobile (375) + 3 more
- **Pages**: Multi-page with rootInstanceId, SEO fields, code injection

### Store Pattern (CRITICAL)
```ts
// ALL UI components MUST use this hook
export function useStore(): EditorV3Store {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => useEditorV3Store.subscribe(forceRender), [])
  return useEditorV3Store.getState()
}
```
Zustand + Immer + Zundo (temporal undo). Partialize excludes: selectedInstanceId, selectedInstanceIds, hoveredInstanceId, currentBreakpointId, currentPageId, zoom, userComponents, site.

### Performance
- **Cached indexes** at module level in iframe-canvas.tsx with version-counter invalidation
- `getDeclIndex()` → `Map<styleSourceId, StyleDeclaration[]>` — O(1) lookup
- `getPropsIndex()` → `Map<instanceId, Prop[]>` — O(1) lookup
- `_storeVersion` bumped on every mutation, indexes rebuild only when version changes
- `useCanvasInstance(id)` — targeted subscription per instance via `snapshotFor()`

### Style Cascade
Canvas resolves styles from largest breakpoint down to current. Sorted by `minWidth` descending, all breakpoints with `minWidth >= currentWidth` are active. Later (smaller) breakpoints override earlier (larger) ones.

## Components (22)

| Category | Components |
|----------|-----------|
| Layout | Box, Container, Section, Slot |
| Typography | Text, Heading, Paragraph |
| Media | Image, Video |
| Interactive | Button, Link (preventDefault in editor) |
| Forms | Form (preventDefault), Input, Textarea, Label, Checkbox, Radio, SelectField |
| Navigation | Navbar |
| Structure | List, Separator |
| Embed | CodeBlock |

Each component: `forwardRef` + `.meta.ts` with `{ label, category, icon, tag, contentModel, propsSchema }`.
Registered in `register-all.ts`. Referenced in: publish.ts tagMap, navigator icons, components-panel icons, command-palette icons.

## Canvas Interaction Features (22)

### Level 1 — Foundation
1. **Positional drop indicators** — blue line between siblings showing insertion point
2. **Ancestor size-locking** — parent heights freeze during drag to prevent collapse
3. **Absolute element drag** — pointer drag for position:absolute/fixed elements

### Level 2 — Direct Manipulation
4. **Canvas drag reorder** — selected elements are draggable, drop at cursor position
5. **8 resize handles** — corners + edges, drag to resize width/height (10px handles)
6. **Smart alignment guides** — red lines at 3px threshold for edge/center alignment with siblings (deduplicated)

### Level 3 — Visual Feedback (Alt-key activated)
7. **Padding overlays** — green zones with px labels, draggable edges
8. **Margin overlays** — orange zones with px labels, draggable edges
9. **Distance indicators** — red lines + px badges to parent edges
10. **Auto-layout suggestion** — "Flex Row" / "Flex Column" buttons on containers with 2+ children

### Level 4 — Power Features
11. **Multi-element drag** — shift+click multi-select, drag all together
12. **Dimensions badge** — W×H in bottom-right (blue selected, gray hovered)
13. **Ctrl+scroll zoom** — ±10% per tick, clamped 25-400%
14. **Double-click drill-in** — selects first child

### Level 5 — Actions
15. **Quick actions bar** — top-right: ↑↓⧉☐✕ (move/duplicate/wrap/delete) with hover effects
16. **Right-click context menu** — Copy (⌘C), Paste (⌘V), Duplicate (⌘D), Wrap in Box, Delete (⌫)
17. **Copy/paste elements** — module-level clipboard, Ctrl+C/V
18. **Wrap in container** — from quick actions or context menu

### Canvas Polish
19. **Hover isolation** — stopPropagation on mouseEnter/Leave
20. **Rounded selection outlines** — matches element's borderRadius
21. **Drag text-select prevention** — body.dragging class
22. **Improved empty container** — stripe pattern + "Drop elements here"

## Style Panel Structure

```
State selector [base ▾]  [Clear all] [Visible]
Style Sources [Local] [Token] [+]
Dimensions [W] [H] [MinW] [MaxW] [R]  ← Figma pattern
Box Model (margin 🔗 / padding 🔗)    ← Link toggles
Layout (display pills, 3×3 align box, direction arrows, wrap, gap)  ← Webflow pattern
Typography (2-col grid: font, weight+size, height+spacing, color+align, decoration+transform)
Fill (color swatch + opacity scrub)    ← Figma pattern
Stroke (color + width + style)         ← Figma pattern
Size (width, height, min/max, aspectRatio, overflow, objectFit)
Position (collapsed: position, top/right/bottom/left, zIndex)
Border (radius, shadow, outline)
Effects (collapsed: transform, filter, transition, cursor, etc.)
Custom CSS (textarea + Apply)
```

## Sub-Components

- **BoxModelEditor**: Nested rectangles (orange margin, green padding, blue element), link toggles (Link2/Unlink), w-12 inputs
- **ColorPicker**: HSV saturation canvas, hue slider, alpha slider (checkerboard), HEX/RGB toggle, eyedropper, preset swatches, recent colors (last 8)
- **GradientEditor**: Linear/radial, angle, color stops
- **FontPicker**: Google Fonts browser (50 fonts), search, preview
- **NumericScrubInput**: Drag to scrub, arrow nudge ±1/±10, unit cycling, unit-aware sensitivity (px=1, rem=0.1, %=0.5), unit-aware rounding

## Shell Structure

```
EditorShell (layout orchestrator)
├── CommandPalette (⌘K)
├── EditorToolbar (logo, page selector, breakpoints, undo/redo, preview, publish)
├── LeftSidebar (5 icon tabs: Navigator, Add, Blocks, Pages, Assets)
│   ├── Navigator (tree view, drag reorder, context menu, search)
│   ├── ComponentsPanel (search filter, 2-col grid, drag to canvas)
│   ├── TemplatesPanel (block templates, user components)
│   ├── PagesPanel (CRUD pages)
│   └── AssetsPanel (image management)
├── Canvas (IframeCanvas or ResponsivePreview)
├── RightSidebar (2 tabs: Style, Settings)
│   ├── StylePanel + Presets (collapsible)
│   └── SettingsPanel + SEO + Tokens + Accessibility (collapsible)
└── BottomBar (breadcrumb, element count, zoom controls, ⌘scroll hint)
```

## Security

- **XSS Prevention**: `esc()` for HTML, `escCSS()` for CSS values, `sanitizeInjectedCode()` for headCode/bodyCode, `sanitizeUrl()` for href/src in HTML import
- **API Auth**: All routes use `requireUser()` + `tenantId` ownership checks
- **Schema**: `editor_projects` has `tenant_id` column, all queries filter by it

## Publishing

- `publishFromStore()` → single page HTML with inline CSS + media queries
- `publishAllPages()` → multi-page ZIP with shared styles
- Style cascade: base styles + media queries for each breakpoint
- Self-closing tags: img, input, hr
- Component-specific attributes: Image (src/alt), Link (href/target), Video (src/poster/autoplay/loop/muted/controls), Form (action/method), Input (type/name/placeholder), Textarea, Checkbox, Radio, SelectField, Label, Button

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘Z | Undo |
| ⌘⇧Z | Redo |
| ⌘C / ⌘V | Copy/paste element |
| ⌘D | Duplicate |
| ⌘K | Command palette |
| Alt+C / Alt+V | Copy/paste styles |
| Delete/Backspace | Delete selected |
| Escape | Deselect |
| Arrow keys | Navigate tree |
| Shift+click | Multi-select |
| Double-click | Drill into child / Edit text |
| ⌘+scroll | Zoom canvas |

## File Map

```
src/features/editor-v3/
├── components/          22 components (tsx + meta.ts each) + register-all.ts
├── stores/              store.ts, instances.ts, props.ts, styles.ts, editor.ts, pages.ts, breakpoints.ts, assets.ts, site.ts, persistence.ts, indexes.ts
├── ui/
│   ├── canvas/          iframe-canvas.tsx (1020 lines), canvas.tsx, responsive-preview.tsx
│   ├── components/      box-model-editor, color-picker, gradient-editor, font-picker, numeric-scrub-input, inline-rich-text
│   ├── panels/          style-panel, settings-panel, seo-panel, tokens-panel, style-presets-panel, accessibility-panel
│   ├── shell/           editor-shell, editor-toolbar, left-sidebar, right-sidebar, bottom-bar, command-palette, keyboard-shortcuts, selection-breadcrumb
│   ├── sidebar/         navigator, components-panel, templates-panel, pages-panel, assets-panel
│   └── hooks/           use-google-fonts
├── registry/            registry.ts, content-model.ts
├── types.ts, id.ts, index.ts, publish.ts, html-import.ts, templates.ts, zip.ts
```
