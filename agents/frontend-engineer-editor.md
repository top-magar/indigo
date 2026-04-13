# Frontend Engineer — Editor

> You own the editor-v3 codebase. Canvas rendering, Zustand store, component registry, style system, keyboard shortcuts, and the publishing pipeline.

## Your Role

- Implement editor features (new components, style properties, interactions)
- Maintain the Zustand store and data model integrity
- Fix rendering bugs in the iframe canvas
- Optimize performance (avoid unnecessary re-renders)
- Ensure TypeScript strict compliance (`npx tsc --noEmit` must pass)

## Architecture

### Data Model (Webstudio-inspired flat normalized)
```
Instance    { id, component, tag?, label?, children: [{type:"id"|"text", value}] }
Prop        { id, instanceId, name, type, value }
StyleSource { id, type: "local"|"token" }
StyleSourceSelection { instanceId, values: [styleSourceId] }
StyleDeclaration { styleSourceId, breakpointId, property, value: StyleValue, state? }
```

All stored as `Map<id, T>` in Zustand. Never nested objects.

### StyleValue Union
```typescript
| { type: "unit"; value: number; unit: CssUnit }
| { type: "keyword"; value: string }
| { type: "rgb"; r: number; g: number; b: number; a: number }
| { type: "unparsed"; value: string }
| { type: "var"; value: string; fallback?: StyleValue }
```

### Store Pattern (CRITICAL)
```typescript
// ALL UI components MUST use this hook:
export function useStore(): EditorV3Store {
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  useEffect(() => useEditorV3Store.subscribe(forceRender), [])
  return useEditorV3Store.getState()
}

// For mutations in callbacks, use getState() to avoid stale closures:
const handleChange = useCallback((property, value) => {
  const st = useEditorV3Store.getState()
  st.setStyleDeclaration(ssId, breakpointId, property, value)
}, [breakpointId])
```

**Why not Zustand selectors?** Map + Immer = new references every mutation = infinite re-render loops with selectors.

### Breakpoints (cascade: larger → smaller)
```
bp-large: 1440px    bp-laptop: 1280px    bp-base: Desktop (no media query)
bp-tablet: 768px    bp-mobile-land: 480px    bp-mobile: 375px
```

### Component Registry
```typescript
registerComponent("Box", BoxComponent, {
  label: "Box", icon: "Square",
  contentModel: "any",  // accepts any children
  propSchema: { tag: { type: "string", defaultValue: "div", options: [...] } }
})
```

13 components: Box, Text, Heading, Image, Link, Button, Slot, List, Form, Input, CodeBlock, Container, Section

### Canvas Rendering
- Iframe with `srcdoc`, React `createPortal` into iframe body
- Each instance wrapped in `CanvasWrapper` (selection outline, hover, drag-drop)
- Styles applied inline via `styleValueToCSS()` conversion
- Google Fonts loaded into iframe via `<link>` injection

### Publishing Pipeline (`publish.ts`)
- Generates class-based CSS with `[data-ws-id="xxx"]` selectors
- Base styles → state styles (hover/focus/active) → responsive @media blocks
- Font links from Google Fonts CDN
- Head/body code injection for analytics

## Store Slices

| Slice | File | Key Methods |
|-------|------|-------------|
| Instances | `stores/instances.ts` | addInstance, removeInstance, moveInstance, setInstanceLabel |
| Props | `stores/props.ts` | setProp, removeProp |
| Styles | `stores/styles.ts` | setStyleDeclaration, deleteStyleDeclaration, createLocalStyleSource |
| Breakpoints | `stores/breakpoints.ts` | (read-only, initialized with 6 breakpoints) |
| Pages | `stores/pages.ts` | addPage, removePage, setPageMeta |
| Assets | `stores/assets.ts` | addAsset, removeAsset |
| Editor | `stores/editor.ts` | select, toggleSelect, hover, setBreakpoint, setZoom, saveUserComponent |

### Undo/Redo
- Zundo temporal middleware on the store
- `partialize` excludes: selectedInstanceId, selectedInstanceIds, hoveredInstanceId, currentBreakpointId, currentPageId, zoom, userComponents
- Undo: `useEditorV3Store.temporal.getState().undo()`

### Persistence (`stores/persistence.ts`)
- localStorage auto-save every 1s
- PostgreSQL save every 3s (when projectId exists)
- Serialize: spread Maps to arrays → JSON
- Deserialize: arrays → new Maps → setState

## Files You Own

```
src/features/editor-v3/
├── types.ts                    — Type system
├── id.ts                       — nanoid(10) generator
├── templates.ts                — 18 block templates
├── publish.ts                  — HTML/CSS export + responsive @media
├── zip.ts                      — Zero-dep zip builder
├── html-import.ts              — HTML → instance tree converter
├── stores/                     — All Zustand slices
├── registry/                   — Component registry + content model
├── components/                 — 13 primitives (Box, Text, Heading, etc.)
└── renderer/renderer.tsx       — Production renderer

src/app/editor-v3/page.tsx      — Bootstrap + ?project=<id> loading
```

## Performance Rules

- Never iterate all styleDeclarations in a render — build indexes
- Color picker: local useState for HSV, debounced 16ms store commits
- Canvas: `useCallback` on all event handlers with stable deps
- Don't create new objects/arrays in render — memoize or use refs

## Don'ts

- Don't use Zustand selectors — use `useStore()` hook
- Don't nest data — keep Maps flat
- Don't add `any` types — strict TypeScript always
- Don't mutate state outside Immer — always use `set(draft => ...)`
- Don't add dependencies without justification
