# SESSION CHECKPOINT — Editor V3

**Date:** April 12, 2026
**Status:** Feature-rich visual website editor at /editor-v3
**Stats:** 66 files | ~3,989 lines | 0 TS errors

## ARCHITECTURE
Webstudio-inspired flat normalized data model. Zustand + Immer + Zundo. 10 primitives, component/meta split. Completely separate from v1/v2 — no shared code.

### Critical Pattern
```ts
// ALL UI components must use this hook, NOT Zustand selectors
// Map + Immer = new references every mutation = infinite re-render loops
// ui/use-store.ts
export function useStore(): EditorV3Store {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => useEditorV3Store.subscribe(forceRender), [])
  return useEditorV3Store.getState()
}
```

### Store
8 Zustand slices combined with `enableMapSet()` + Immer + Zundo temporal:
- instances (flat Map), props, styles (3-layer), breakpoints, pages, assets, editor
- Editor state (selection/hover/breakpoint/page) excluded from undo via `partialize`
- Zundo v2 API: `useEditorV3Store.temporal.getState().undo()`

### Template Pattern
Templates build flat instance/prop/style arrays via `buildTree()`, then `setState()` inserts everything into Maps at once.

## COMPLETE FEATURE LIST

### Core Engine
- Flat Map<id, entity> data model
- 3-layer typed CSS (StyleSource → StyleSourceSelection → StyleDeclaration)
- 10 primitives: Box, Text, Heading, Image, Link, Button, Slot, List, Form, Input
- Component/meta split (.tsx runtime + .meta.ts editor-only)
- Content model validation (canAcceptChild, validateTree)
- Undo/redo (Zundo temporal)

### Canvas
- Recursive instance renderer with selection/hover overlays
- Inline text editing (double-click → contentEditable)
- Drag-drop from components panel + navigator
- Image file drag-drop (reads as data URL, creates Image instance)
- Responsive preview (desktop=full / tablet=768px / mobile=375px)
- Empty container "Drop here" placeholders

### Left Sidebar (4 tabs)
- **Navigator** — tree view, expand/collapse, click-to-select, drag handle
- **Add** — components grouped by category, content model validation, draggable
- **Blocks** — 12 e-commerce templates in 3 categories
- **Pages** — add/switch/delete pages, auto-path generation

### Right Sidebar (3 tabs)
- **Settings** — auto-generated prop editors from propsSchema + SEO panel (title/description/OG image with char counters)
- **Styles** — 7 property groups (Layout, Spacing, Size, Typography, Background, Border, Effects) + color picker swatch + font family dropdown (25 fonts) + responsive breakpoint indicator dots + custom CSS textarea
- **Tokens** — create/edit/apply reusable design token style sources

### Toolbar
- Undo/redo buttons
- Breakpoint switcher (desktop/tablet/mobile icons)
- Export (single page HTML download)
- All (multi-page zip download)
- Preview (opens in new tab)

### Keyboard Shortcuts
- Cmd+Z / Cmd+Shift+Z — undo/redo
- Delete/Backspace — remove selected instance
- Escape — deselect
- Cmd+C / Cmd+V — copy/paste (deep clone with styles)
- Cmd+D — duplicate (deep clone)
- Input guard — shortcuts skip when focus is in INPUT/TEXTAREA/contentEditable

### Templates (12)
- **Navigation:** Header Simple, Header Centered, Footer Columns
- **Sections:** Hero Centered, Hero Split, Features 3-Column, Newsletter CTA, Testimonials, Pricing Table, FAQ Section
- **Commerce:** Product Card, Product Grid 3-Up

### Publishing
- Single page HTML export with inline styles
- Multi-page zip export (all pages)
- Global sections — label with @ prefix (@Header, @Footer) auto-injects into all pages
- Google Fonts `<link>` tags in editor (useGoogleFonts hook) and exported HTML
- SEO meta tags (description, og:title, og:image) in exported HTML
- Zero-dependency zip builder (56 lines)

### Persistence
- localStorage auto-save (debounced 1s)
- PostgreSQL via Drizzle (debounced 3s auto-save when project loaded)
- API: `/api/editor-v3/projects` (GET list, POST create) + `/api/editor-v3/projects/[id]` (GET load, PUT update)
- URL: `?project=<uuid>` loads from database, no param = localStorage
- Serialize/deserialize Maps to JSON/JSONB

## FILE STRUCTURE
```
src/features/editor-v3/              53 files | 2,777 lines
├── types.ts                         Type system (Instance, Prop, StyleValue, etc.)
├── id.ts                            nanoid(10) wrapper
├── index.ts                         Public exports
├── templates.ts                     12 block templates via buildTree()
├── publish.ts                       HTML generation + multi-page + global sections + SEO
├── zip.ts                           Zero-dep zip builder
├── stores/
│   ├── instances.ts                 Flat Map CRUD + recursive delete
│   ├── props.ts                     Typed props decoupled from instances
│   ├── styles.ts                    3-layer: StyleSource → Selection → Declaration
│   ├── breakpoints.ts               3 defaults (base/tablet/mobile)
│   ├── pages.ts                     CRUD with rootInstanceId
│   ├── assets.ts                    Typed assets
│   ├── editor.ts                    Selection, hover, breakpoint, page state
│   ├── store.ts                     Combined store with enableMapSet() + temporal
│   ├── indexes.ts                   buildParentIndex, buildPropsIndex, buildResolvedStyles
│   └── persistence.ts               localStorage serialize/deserialize/auto-save
├── registry/
│   ├── registry.ts                  registerComponent, getComponent, getMeta
│   └── content-model.ts             canAcceptChild, validateTree
├── components/                      10 primitives × (.tsx + .meta.ts) + register-all.ts
├── renderer/renderer.tsx            Tree-walking instance resolver (production)
├── ui/
    ├── use-store.ts                 Critical hook (avoids Map selector infinite loops)
    ├── hooks/use-google-fonts.ts    Google Fonts <link> injection (targets iframe doc)
    ├── canvas/canvas.tsx            Canvas (legacy, replaced by iframe-canvas)
    ├── canvas/iframe-canvas.tsx     Iframe-isolated canvas + createPortal
    ├── sidebar/
    │   ├── navigator.tsx            Tree view
    │   ├── components-panel.tsx     Grouped components
    │   ├── templates-panel.tsx      12 templates by category
    │   └── pages-panel.tsx          Page management
    ├── panels/
    │   ├── settings-panel.tsx       Auto-generated prop editors
    │   ├── style-panel.tsx          7 groups + color picker + font picker + custom CSS
    │   ├── tokens-panel.tsx         Design tokens CRUD
    │   └── seo-panel.tsx            Page-level SEO metadata
    └── shell/
        ├── editor-shell.tsx         Main layout + toolbar
        └── keyboard-shortcuts.ts    All shortcuts + deep clone

src/app/editor-v3/
├── page.tsx                         Bootstrap + ?project=<id> loading
└── layout.tsx                       Minimal layout (no auth)

src/app/api/editor-v3/projects/
├── route.ts                         GET list, POST create
└── [id]/route.ts                    GET load, PUT update

src/db/schema/editor-projects.ts     Drizzle schema (editor_projects table)
```

## ROUTE
- URL: http://localhost:3000/editor-v3
- Auth: bypassed via `src/middleware.ts` (added to PUBLIC_ROUTES)

## NEXT STEPS (for future sessions)
1. ~~**iframe canvas isolation** — CSS encapsulation between editor UI and canvas~~ ✅ Done
2. ~~**Save to database** — replace localStorage with Supabase/PostgreSQL API~~ ✅ Done
3. **Real-time collaboration** — JSON patches between clients (deferred)
4. ~~**Custom code component** — embed raw HTML/CSS/JS blocks~~ ✅ Done
5. ~~**Animation/transition editor** — CSS transitions on hover/scroll~~ ✅ Done
6. ~~**Asset manager** — upload/browse/organize images and files~~ ✅ Done
7. ~~**Version history** — save snapshots, restore previous versions~~ ✅ Done
8. ~~**Component variants** — responsive variants per breakpoint~~ ✅ Done

### Future
- Real-time collaboration (JSON patches between clients)
- Drag-and-drop reorder in navigator
- Component search/filter
- Style presets library
- Responsive preview in canvas (show all breakpoints side by side)
- Undo/redo for database-saved projects
- User authentication for editor projects

## REFERENCE
- Webstudio repo (architecture reference only): ~/Desktop/webstudio
- Editor V3 route: http://localhost:3000/editor-v3
