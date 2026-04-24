# Editor-V3 Comprehensive Analysis

> Synthesized from core architecture, UI layer, and component system analyses.
> Generated: 2026-04-15

---

## 1. Executive Summary

Editor-V3 is a visual website builder built on a **normalized ECS (Entity-Component-Style) data model** using Zustand + Immer, inspired by Webstudio's architecture. The core data model — flat Maps with ID references, a 3-layer style system, and content-model validation — is architecturally sound and the right foundation for a visual editor. However, **performance will collapse at ~200+ elements** due to unmemoized index selectors that rebuild on every render (O(n²) in `renderer.tsx` and `stores/indexes.ts`). The 22 registered components are functional primitives but lack default styles, accessibility attributes, and e-commerce specifics — users must style everything from scratch. Two files (`iframe-canvas.tsx` at 1,038 lines and `style-panel.tsx` at 607 lines) concentrate too much logic and mutable state, creating high maintenance risk. The system is a **strong prototype** (estimated 35-40% of a production website builder) that needs performance fixes, cascading deletes, schema migrations, and ~15 additional components before it can ship.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EDITOR SHELL                                  │
│  editor-shell.tsx                                                    │
│  ┌──────────┐  ┌──────────────────────────┐  ┌───────────────────┐  │
│  │  LEFT     │  │     IFRAME CANVAS        │  │  RIGHT SIDEBAR    │  │
│  │  SIDEBAR  │  │  iframe-canvas.tsx        │  │                   │  │
│  │           │  │                           │  │  style-panel.tsx   │  │
│  │ navigator │  │  ┌─────────────────────┐  │  │  settings-panel   │  │
│  │ components│  │  │  createPortal() →    │  │  │  seo-panel        │  │
│  │ templates │  │  │  Renderer            │  │  │  tokens-panel     │  │
│  │ pages     │  │  │  renderer.tsx        │  │  │  presets-panel    │  │
│  │ assets    │  │  │                      │  │  │  a11y-panel       │  │
│  │           │  │  │  RenderInstance ×N   │  │  │                   │  │
│  │           │  │  └──────────┬───────────┘  │  │                   │  │
│  └──────────┘  │             │               │  └───────────────────┘  │
│                 │  Overlays: resize, guides,  │                        │
│                 │  spacing, context menu,      │                        │
│                 │  quick actions, drop line    │                        │
│                 └──────────────────────────────┘                        │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  BOTTOM BAR: breadcrumb · element count · zoom                 │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

                         DATA FLOW

  ┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
  │  REGISTRY    │     │  ZUSTAND      │     │  PERSISTENCE     │
  │              │     │  STORE        │     │                  │
  │ registry.ts  │────▶│  store.ts     │◀───▶│ persistence.ts   │
  │ register-    │     │               │     │ localStorage +   │
  │ all.ts       │     │  8 slices:    │     │ REST API         │
  │              │     │  instances    │     └──────────────────┘
  │ 22 components│     │  props        │
  │ + metas      │     │  styles (3L)  │     ┌──────────────────┐
  └──────────────┘     │  breakpoints  │     │  PUBLISH         │
                       │  pages        │────▶│  publish.ts      │
                       │  assets       │     │                  │
                       │  editor (UI)  │     │  Instance tree   │
                       │  site         │     │  → HTML tags     │
                       └───────┬───────┘     │  → CSS rules     │
                               │             │  → Google Fonts   │
                       ┌───────▼───────┐     │  → Multi-page    │
                       │  INDEXES       │     │  → Zip export    │
                       │  indexes.ts    │     │  zip.ts          │
                       │                │     └──────────────────┘
                       │ parentIndex    │
                       │ propsIndex     │     ┌──────────────────┐
                       │ styleDeclIndex │     │  HTML IMPORT     │
                       │ resolvedStyles │     │  html-import.ts  │
                       └───────────────┘     └──────────────────┘

  STYLE SYSTEM (3-layer indirection):

  StyleSource ──────▶ StyleSourceSelection ──────▶ StyleDeclaration
  (local|token)       (instance → [sources])       (source+bp+prop → value)
```

---

## 3. Scorecard

| Area | Score | Key Finding |
|------|-------|-------------|
| **State Management** | 7/10 | Normalized ECS model with Zustand+Immer is correct. Undo/redo via Zundo works. Loses points for unmemoized selectors (`stores/indexes.ts`), orphaned data on delete (`stores/instances.ts`), and `as never` casts in `stores/store.ts`. |
| **Component System** | 6/10 | Clean meta+component+registry pattern (`registry/registry.ts`). 22 components registered. Loses points for no default styles on 19/22 components, no accessibility attributes, minimal props (Input missing `required`/`disabled`), and Navbar being a non-composable monolith. |
| **Canvas/Renderer** | 5/10 | Iframe isolation via `createPortal` is the right approach (`iframe-canvas.tsx`). Loses points heavily for `useForceRenderOnStoreChange` re-rendering everything, `renderer.tsx` rebuilding full indexes per-instance per-render (O(n²)), module-level mutable state, and `QuickActions` bypassing the store with direct `splice`. |
| **Style Editor** | 7/10 | Sophisticated 3-layer style system with breakpoint cascade, pseudo-states, and token support. Good UX with layout grid, box model editor, color picker. Loses points for 607-line god component (`style-panel.tsx`), O(n) declaration scanning per render, duplicated `parseValue`/`formatValue` in `tokens-panel.tsx`. |
| **Publish Pipeline** | 7/10 | Generates valid multi-page HTML with CSS, Google Fonts, and zip export (`publish.ts`, `zip.ts`). Loses points for duplicated tag mapping (should live in ComponentMeta), O(n×m) CSS collection, basic XSS sanitization, and breakpoint semantic mismatch (store uses `minWidth`, publish emits `max-width`). |
| **UI/UX** | 6/10 | Functional editor shell with command palette, keyboard shortcuts, drag-and-drop. Loses points for no tree virtualization in navigator (`navigator.tsx`), `prompt()` for HTML import (`command-palette.tsx`), duplicated `deepCloneInstance` logic, no dirty tracking for save indicator, poor editor accessibility (no ARIA roles, no keyboard nav for canvas). |
| **Performance** | 3/10 | The #1 risk. `use-store.ts` re-renders all consumers on every mutation. `buildPropsIndex`/`buildResolvedStyles` in `stores/indexes.ts` return new Maps every time (no memoization). `SmartGuides` polls at 60fps. Base64 images bloat undo history. Will not scale past ~200 elements. |
| **Production Readiness** | 4/10 | No tests. No schema migration (`stores/persistence.ts`). No error boundaries in renderer. Dead code (`canvas.tsx`). No asset upload integration. No collaborative editing. Estimated 35-40% complete for a shippable website builder. |

---

## 4. What Works Well

1. **Normalized data model** — Flat `Map<Id, Entity>` stores with ID cross-references (`stores/instances.ts`, `stores/props.ts`, `stores/styles.ts`). This is the correct pattern for a visual editor — enables efficient updates without tree traversal, clean serialization, and undo/redo.

2. **3-layer style system** — `StyleSource → StyleSourceSelection → StyleDeclaration` (`stores/styles.ts`, `types.ts`). Supports local instance styles AND reusable tokens with breakpoint-aware cascade. This is more sophisticated than most website builders.

3. **Content model validation** — Category-based parent-child rules in `registry/content-model.ts` prevent invalid nesting (e.g., `<input>` inside `<heading>`). Clean, declarative, extensible.

4. **Component registration pattern** — `meta.ts` + `component.tsx` + `register-all.ts` is a clean 3-file pattern. Adding a new component touches exactly 3 files. Meta is pure serializable data, components are pure React.

5. **Iframe canvas isolation** — `iframe-canvas.tsx` uses `createPortal` into an iframe with `srcDoc`. Editor CSS cannot leak into user content. Real browser layout for accurate measurements.

6. **Undo/redo** — Zundo temporal middleware in `stores/store.ts` with proper partialization (UI state excluded from history). Works out of the box.

7. **Type system** — Discriminated unions for `Prop` and `StyleValue` in `types.ts`. Tagged unions catch invalid states at compile time. `getStyleDeclKey()` provides type-safe composite keys.

8. **Publish pipeline** — `publish.ts` generates valid static HTML with `[data-ws-id]` CSS selectors, pseudo-state rules, responsive `@media` queries, and Google Fonts auto-detection. Multi-page support with global header/footer injection.

9. **Zero-dependency zip builder** — `zip.ts` produces valid zip files without any library. Pragmatic and bloat-free.

10. **UX components** — `numeric-scrub-input.tsx` (9/10 quality — drag-to-scrub with unit cycling), `color-picker.tsx` (HSV with eyedropper API), `box-model-editor.tsx` (Figma-like visual editor). These are polished.

---

## 5. Critical Gaps

### Performance (blocks scaling)
- **Unmemoized index selectors** — `stores/indexes.ts` functions (`buildParentIndex`, `buildPropsIndex`, `buildResolvedStyles`) return new `Map` objects on every call. Zustand treats these as changed, triggering re-renders across all subscribers.
- **Per-instance full index rebuild** — `renderer/renderer.tsx` `RenderInstance` calls `useEditorV3Store(buildPropsIndex)` for every instance. 500 instances = 500 full rebuilds per state change.
- **Broadcast subscriptions** — `use-store.ts` `useForceRenderOnStoreChange` re-renders every consumer on every mutation, including hover and selection changes.

### Data Integrity (causes bugs)
- **No cascading delete** — `stores/instances.ts` `removeInstance` does not clean up props, styles, or style source selections. Orphaned data accumulates silently.
- **No schema migration** — `stores/persistence.ts` has no version field. Type changes will silently corrupt saved projects.
- **Breakpoint mismatch** — `stores/breakpoints.ts` uses `minWidth` (mobile-first) but `publish.ts` generates `max-width` (desktop-first) media queries.

### Missing Infrastructure
- **No tests** — Zero test files across all 50+ modules.
- **No error boundaries** — `renderer/renderer.tsx` has no error boundary. A broken component crashes the entire editor.
- **No asset upload** — `stores/assets.ts` stores URLs as strings. No S3/CDN integration. Images stored as base64 data URLs in `assets-panel.tsx`.
- **No collaborative editing** — No conflict resolution, operational transforms, or real-time sync.

### Missing Features (expected in any website builder)
- **No CSS animations/transitions** — No animation primitives in the style system.
- **No interactions** — No scroll triggers, click handlers, or animation timeline.
- **No CMS/data binding** — No dynamic content or data source integration.
- **No responsive preview in editor** — Breakpoint switching exists but styles only cascade correctly in publish, not in the renderer.
- **No code export** — Only raw HTML. No React/Next.js/framework export option.

---

## 6. Technical Debt

### Critical (fix before scaling)

| Issue | File | Detail |
|-------|------|--------|
| Index selectors rebuild on every call | `stores/indexes.ts` — all 4 `build*` functions | Return new `Map` each time → Zustand sees as changed → all subscribers re-render. Need `createSelector` with equality check or `useMemo`. |
| Renderer O(n²) | `renderer/renderer.tsx` — `RenderInstance` component | Calls `useEditorV3Store(buildPropsIndex)` and `useEditorV3Store(buildResolvedStyles)` per instance. Must use instance-scoped selectors or React context. |
| `useForceRenderOnStoreChange` | `use-store.ts` (line ~10) | Every component using `useStore()` re-renders on every mutation. Used by iframe-canvas, navigator, breadcrumb, bottom-bar. Replace with granular selectors. |
| Orphaned data on delete | `stores/instances.ts` — `removeInstance` | Does not clean up props, styles, or style source selections. Need `deleteInstanceDeep()`. |
| No schema migration | `stores/persistence.ts` — `loadFromLocalStorage`, `loadFromDatabase` | No version field in serialized data. `isValidSerializedData` only checks top-level shape. |
| `QuickActions` bypasses store | `iframe-canvas.tsx` — `QuickActions` component | `moveUp`/`moveDown` directly mutates `parent.children` via `splice` then calls `setState({})`. Bypasses undo history. |

### High (causes maintenance pain)

| Issue | File | Detail |
|-------|------|--------|
| Duplicated `deepCloneInstance` | `keyboard-shortcuts.ts` (~60 lines) and `navigator.tsx` (~60 lines) | Nearly identical subtree cloning logic. Extract to `utils/clone.ts`. |
| Duplicated `parseValue`/`formatValue` | `style-panel.tsx` and `tokens-panel.tsx` | Same CSS value parsing in two files. Extract to `utils/style-values.ts`. |
| Duplicated publish logic | `editor-shell.tsx` and `command-palette.tsx` | Both call `publishFromStore` with inline callback logic. Extract to a shared action. |
| Duplicated tag mapping | `publish.ts` `tagMap` and component metas | Tag-to-HTML mapping exists in both publish and component registration. Should live only in ComponentMeta. |
| Module-level mutable state | `iframe-canvas.tsx` — `_clipboard`, `_declVersion`, `_declIndex`, `_propsIndex`, `_storeVersion`, `_activeGuides` | 7 module-level mutable variables. Not React-safe, not testable. Move to store or refs. |
| Module-level mutable state | `keyboard-shortcuts.ts` — `clipboard`, `styleClipboard` | Mutable globals for copy/paste. Should be in store or React context. |
| `as never` casts | `stores/store.ts` — all 8 slice creator calls | Zustand+Immer typing workaround. Hides real type errors. |
| Auto-save too broad | `stores/persistence.ts` — `startAutoSave` | Subscribes to ALL state changes including hover/selection. Triggers save debounce on every mouse move over canvas. |

### Medium (cleanup when touching these files)

| Issue | File | Detail |
|-------|------|--------|
| Dead code | `canvas.tsx` (195 lines) | Not imported by `EditorShell`. Entire file is unused. Delete it. |
| `prompt()` for HTML import | `command-palette.tsx` | Uses browser `prompt()` dialog. Replace with modal. |
| Icon map duplication | `components-panel.tsx`, `navigator.tsx`, `templates-panel.tsx` | Same icon-to-component mapping in 3 files. Extract to shared constant. |
| Font `<link>` leak | `font-picker.tsx` — `loadFont` | Creates `<link>` tags that are never removed. `loadedFonts` Set is module-level. |
| Silent error swallowing | `templates-panel.tsx` | `catch { /* ignore parse errors */ }` on user component insertion. |
| `getStyleDeclKey` in types.ts | `types.ts` | Runtime function in a types-only file. Move to utils. |
| Base64 images in store | `assets-panel.tsx` | Large images bloat Zustand store and undo history. Need external storage. |

---

## 7. The Two Giants

### `iframe-canvas.tsx` — 1,038 lines (47K) — Verdict: **MUST split**

This file contains 15+ components and functions with 7 module-level mutable variables. It is the highest-risk file in the codebase.

**What's crammed in:**
- `CanvasInstance` — per-element wrapper with click/hover/drag handlers
- `CanvasWrapper` — iframe setup, portal rendering, keyboard forwarding
- `ResizeHandles` — 8-handle resize with aspect ratio lock
- `SmartGuides` — alignment guide lines (polls at 60fps via `setInterval`)
- `SpacingOverlay` — margin/padding visualization
- `DistanceIndicators` — distance measurement between elements
- `DropLine` — drag-and-drop insertion indicator
- `CanvasContextMenu` — right-click menu (custom div, no ARIA)
- `QuickActions` — floating action bar (directly mutates children array)
- `AutoLayoutSuggestion` — flex layout detection
- `lockAncestorSizes`/`unlockAncestorSizes` — direct DOM mutation helpers
- `useCanvasInstance` — per-instance subscription hook
- `getDeclIndex`/`getPropsIndex` — cached index builders with version tracking

**Why it's dangerous:**
1. `QuickActions.moveUp/moveDown` uses `splice` on `parent.children` directly, bypassing the store → **undo doesn't capture these moves**
2. `_clipboard`, `_activeGuides`, `_storeVersion` etc. are module-level mutable state → not React-safe, breaks with concurrent features
3. `SmartGuides` uses `setInterval(16)` (60fps polling) instead of subscribing to drag state
4. `useForceRenderOnStoreChange()` at the top level re-renders the entire canvas on any store mutation

**Recommended split (5 files):**

| New File | Contents | Est. Lines |
|----------|----------|------------|
| `canvas-instance.tsx` | `CanvasInstance`, `useCanvasInstance`, index caches | ~250 |
| `canvas-wrapper.tsx` | `CanvasWrapper`, iframe setup, portal, keyboard forwarding | ~200 |
| `canvas-overlays.tsx` | `ResizeHandles`, `SmartGuides`, `SpacingOverlay`, `DistanceIndicators`, `DropLine` | ~350 |
| `canvas-context-menu.tsx` | `CanvasContextMenu` (rewrite with Radix `ContextMenu` for ARIA) | ~100 |
| `canvas-quick-actions.tsx` | `QuickActions`, `AutoLayoutSuggestion` (fix to use store actions) | ~150 |

---

### `style-panel.tsx` — 607 lines (34K) — Verdict: **Should split**

This file inlines 8 sub-components that should be separate files. Less dangerous than iframe-canvas (no mutable globals, no store bypassing) but hard to maintain and test.

**What's crammed in:**
- `StylePanel` — main orchestrator, builds `currentStyles` by iterating ALL declarations
- `LayoutSection` — display, flex direction, alignment grid, gap, wrap
- `TypographySection` — font, weight, size, line-height, letter-spacing, color, alignment, decoration
- `FillSection` — background color + opacity
- `StrokeSection` — border color + width + style
- `StyleRow` — generic label+input row
- `StyleGroup` — collapsible section wrapper
- `StyleSourceSelector` — local/token source picker (calls `getState()` inside render)

**Why it should split:**
1. `currentStyles` is rebuilt by iterating all `styleDeclarations.values()` on every render — O(n) where n = total declarations across all instances
2. `parseValue`/`formatValue` are duplicated in `tokens-panel.tsx`
3. `StyleSourceSelector` calls `useEditorV3Store.getState()` inside render — breaks React's subscription model
4. Each section is independently testable but currently untestable in isolation

**Recommended split (6 files):**

| New File | Contents | Est. Lines |
|----------|----------|------------|
| `style-panel.tsx` | Orchestrator only — section composition + `currentStyles` computation | ~80 |
| `style-layout-section.tsx` | `LayoutSection` | ~120 |
| `style-typography-section.tsx` | `TypographySection` | ~100 |
| `style-fill-stroke-section.tsx` | `FillSection` + `StrokeSection` | ~80 |
| `style-source-selector.tsx` | `StyleSourceSelector` | ~60 |
| `utils/style-values.ts` | `parseValue`, `formatValue`, `StyleRow`, `StyleGroup` | ~80 |

---

## 8. Component Inventory

| # | Component | Category | Status | Default Styles | Props Complete | Children | Key Issue |
|---|-----------|----------|--------|----------------|----------------|----------|-----------|
| 1 | Box | layout | ✅ Complete | ✅ `boxSizing` | ✅ `tag` with 8 options | ✅ | Solid generic container |
| 2 | Section | layout | ⚠️ Partial | ❌ TSX only | ⚠️ `padding` enum only | ✅ | Padding in TSX not meta — inconsistent |
| 3 | Container | layout | ✅ Complete | ✅ meta + TSX | ✅ `maxWidth` | ✅ | Best-implemented component |
| 4 | Heading | typography | ⚠️ Partial | ❌ None | ⚠️ `level` as number not enum | ❌ | No default font sizes per level |
| 5 | Text | typography | ⚠️ Partial | ❌ None | ❌ Zero props | ❌ | Too minimal — no formatting props |
| 6 | Button | general | ⚠️ Partial | ❌ None | ⚠️ `type` only | ✅ | Renders unstyled browser button |
| 7 | Link | general | ⚠️ Partial | ❌ None | ✅ `href`, `target` | ✅ | Correct editor-mode preventDefault |
| 8 | List | general | ⚠️ Partial | ❌ None | ✅ `ordered` | ✅ | No list-style props |
| 9 | Slot | general | ✅ Complete | ✅ `display:contents` | N/A | ✅ all | Transparent wrapper — correct |
| 10 | Paragraph | general | ⚠️ Partial | ❌ None | ❌ Zero props | ✅ | Minimal but correct |
| 11 | Separator | general | 🔴 Stub | ❌ None | ❌ Zero props | ❌ | No thickness/color/margin props |
| 12 | Navbar | navigation | ⚠️ Partial | ❌ Inline only | ✅ 7 props | ❌ none | Monolith — hardcoded styles, emoji 🛒, no mobile menu |
| 13 | Image | media | ⚠️ Partial | ❌ None | ⚠️ `src`, `alt` only | ❌ | Missing `loading`, `width`, `height` |
| 14 | Video | media | ✅ Complete | ❌ None | ✅ 6 props | ❌ | Good prop coverage |
| 15 | Code Block | media | ✅ Complete | ❌ None | ✅ `html`, `css`, `js` | ❌ | Proper iframe sandboxing |
| 16 | Form | forms | ⚠️ Partial | ❌ None | ⚠️ `action`, `method` | ✅ | No submission config |
| 17 | Input | forms | ⚠️ Partial | ❌ None | ⚠️ 3 of ~8 needed | ❌ | Missing `required`, `disabled`, `pattern`, `min`, `max` |
| 18 | Textarea | forms | ⚠️ Partial | ❌ None | ⚠️ 3 props | ❌ | Minimal but functional |
| 19 | Label | forms | ✅ Complete | ❌ None | ✅ `htmlFor` | ✅ | Correct form association |
| 20 | Checkbox | forms | 🔴 Stub | ❌ None | ⚠️ `name`, `value` | ❌ | No label association, no `checked` |
| 21 | Radio | forms | 🔴 Stub | ❌ None | ⚠️ `name`, `value` | ❌ | Same issues as Checkbox |
| 22 | Select | forms | 🔴 Stub | ❌ None | ⚠️ `name` only | ✅ | No `<option>` component exists |

**Summary:** 5 complete, 13 partial, 4 stubs. Only 3/22 have default styles in meta. 0/22 have ARIA attributes.

---

## 9. Missing Components for E-commerce

### Tier 1 — Blocks e-commerce use (build first)

| Component | Purpose | Effort | Notes |
|-----------|---------|--------|-------|
| **Product Card** | Image + title + price + add-to-cart | 1 day | Props: `title`, `price`, `currency`, `image`, `salePrice`. Composable with children. |
| **Product Grid** | Responsive grid of product cards | 0.5 day | Wrapper with CSS Grid. Props: `columns`, `gap`. |
| **Price Display** | Formatted price with currency | 0.5 day | Props: `amount`, `currency`, `saleAmount`. Handles locale formatting. |
| **Cart Drawer** | Slide-out cart with line items | 2 days | Needs cart state management (new store slice or external). |
| **Badge** | "Sale", "New", "Out of Stock" labels | 0.5 day | Props: `variant`, `text`. Simple styled span. |
| **Option** | `<option>` for Select component | 0.5 day | Currently missing — Select accepts children but no Option exists. |

### Tier 2 — Expected in any website builder (build second)

| Component | Purpose | Effort | Notes |
|-----------|---------|--------|-------|
| **Hero Section** | Full-width banner with CTA | 1 day | Background image/video + overlay + headline + button. Template-driven. |
| **Footer** | Multi-column links + copyright | 1 day | Composable with Box/Link children. Needs template. |
| **Card** | Generic content card | 0.5 day | Image + title + description + action. |
| **Grid / Columns** | Explicit column layout | 0.5 day | Props: `columns` (2/3/4), `gap`. CSS Grid wrapper. |
| **Icon** | SVG icon component | 1 day | Needs icon library integration (Lucide/Heroicons). Props: `name`, `size`, `color`. |
| **Accordion** | Expandable FAQ sections | 1 day | Needs JS interaction in publish output. |
| **Tabs** | Tabbed content panels | 1 day | Same — needs JS in publish. |
| **Modal / Dialog** | Overlay content | 1 day | Needs JS in publish. Trigger + content pattern. |
| **Testimonial** | Quote + author + avatar | 0.5 day | Composable — mostly a styled template. |
| **Pricing Table** | Plan comparison | 1 day | Complex layout — grid of features × plans. |

### Tier 3 — Nice to have (build as needed)

| Component | Purpose | Effort |
|-----------|---------|--------|
| Breadcrumb | Navigation trail | 0.5 day |
| Pagination | Page navigation | 0.5 day |
| Toast / Alert | Notifications | 0.5 day |
| Avatar | User/author image | 0.5 day |
| Rating / Stars | Product reviews | 0.5 day |
| Countdown Timer | Sale urgency | 1 day |
| Social Links | Icon row | 0.5 day |
| Map Embed | Google Maps iframe | 0.5 day |
| Divider | Styled section divider | 0.5 day |
| Spacer | Explicit vertical spacing | 0.5 day |

**Total estimated effort:** ~18 days for Tier 1+2, ~5 days for Tier 3.

---

## 10. Recommended Next Steps

### Phase 1 — Stabilize (Week 1-2) — Fix what breaks at scale

| Priority | Task | Files | Effort | Impact |
|----------|------|-------|--------|--------|
| P0 | **Memoize index selectors** — Add `createSelector` with `Map` equality or move to `useMemo` with deps | `stores/indexes.ts`, `renderer/renderer.tsx` | 2 days | Fixes O(n²) rendering. Single biggest perf win. |
| P0 | **Replace `useForceRenderOnStoreChange`** — Use granular Zustand selectors per consumer | `use-store.ts`, `iframe-canvas.tsx`, `navigator.tsx`, `bottom-bar.tsx`, `selection-breadcrumb.tsx` | 3 days | Stops broadcast re-renders. |
| P0 | **Implement cascading delete** — `deleteInstanceDeep(id)` removes instance + props + styles + style sources + updates parent | `stores/instances.ts` (new function) | 1 day | Stops orphaned data accumulation. |
| P1 | **Add schema versioning** — Version field in serialized data + migration runner | `stores/persistence.ts` | 1 day | Prevents silent data corruption on type changes. |
| P1 | **Add error boundaries** — Wrap `RenderInstance` and `CanvasInstance` | `renderer/renderer.tsx`, `iframe-canvas.tsx` | 0.5 day | Broken component no longer crashes entire editor. |
| P1 | **Delete dead code** — Remove `canvas.tsx` (195 lines, never imported) | `canvas.tsx` | 0.5 hour | Reduces confusion. |
| P1 | **Fix `QuickActions` store bypass** — Use store actions instead of direct `splice` | `iframe-canvas.tsx` — `QuickActions` | 0.5 day | Restores undo for move operations. |

### Phase 2 — Split & Clean (Week 3-4) — Reduce maintenance risk

| Priority | Task | Files | Effort | Impact |
|----------|------|-------|--------|--------|
| P1 | **Split `iframe-canvas.tsx`** into 5 files | See Section 7 | 2 days | Reduces 1,038-line file to ~200 lines each. Enables testing. |
| P1 | **Split `style-panel.tsx`** into 6 files | See Section 7 | 1 day | Reduces 607-line file. Enables section-level testing. |
| P1 | **Extract duplicated logic** — `deepCloneInstance` → `utils/clone.ts`, `parseValue`/`formatValue` → `utils/style-values.ts`, icon map → `constants/icons.ts` | `keyboard-shortcuts.ts`, `navigator.tsx`, `style-panel.tsx`, `tokens-panel.tsx` | 1 day | Eliminates 4 duplication sites. |
| P2 | **Move module-level mutable state to store** — `_clipboard`, `_activeGuides`, `_recentColors`, `loadedFonts` | `iframe-canvas.tsx`, `keyboard-shortcuts.ts`, `color-picker.tsx`, `font-picker.tsx` | 1 day | React-safe, testable, persistent. |
| P2 | **Fix auto-save scope** — Only subscribe to data slices, not UI state | `stores/persistence.ts` | 0.5 day | Stops wasteful writes on hover/selection. |

### Phase 3 — Components & Features (Week 5-8) — Build toward e-commerce

| Priority | Task | Files | Effort | Impact |
|----------|------|-------|--------|--------|
| P1 | **Add default styles to existing components** — `presetStyle` in meta for Button, Input, Heading, etc. | All 22 `*.meta.ts` files | 2 days | Users no longer start from unstyled browser defaults. |
| P1 | **Build Tier 1 e-commerce components** — ProductCard, ProductGrid, PriceDisplay, Badge, Option, CartDrawer | 6 new component sets (meta + tsx + register) | 5 days | Unblocks e-commerce use case. |
| P1 | **Build Tier 2 builder components** — Hero, Footer, Card, Grid, Icon, Accordion, Tabs | 7 new component sets | 5 days | Matches website builder expectations. |
| P2 | **Add templates** — Hero, footer, product grid, pricing, testimonials, FAQ | `templates.ts` (currently has 1 template) | 3 days | Users can start from pre-built blocks. |
| P2 | **Asset upload integration** — S3/CDN upload, replace base64 storage | `stores/assets.ts`, `assets-panel.tsx`, new upload service | 3 days | Fixes store bloat, enables real image management. |
| P2 | **Responsive preview in editor** — Cascade styles in renderer, not just publish | `renderer/renderer.tsx`, `stores/indexes.ts` | 2 days | WYSIWYG for responsive design. |

### Phase 4 — Production Polish (Week 9-12)

| Priority | Task | Effort | Impact |
|----------|------|--------|--------|
| P2 | **Editor accessibility** — ARIA roles on navigator tree, context menu, color picker; keyboard nav for canvas | 3 days | Required for accessibility compliance. |
| P2 | **Virtualize navigator tree** — Use `react-window` or similar for 500+ element trees | 1 day | Navigator stays responsive at scale. |
| P2 | **Add integration tests** — Store operations, publish output, component rendering | 5 days | Catches regressions. |
| P3 | **Collaborative editing** — CRDT or OT for real-time multi-user | 4+ weeks | Major feature — scope separately. |
| P3 | **Framework export** — React/Next.js code generation from instance tree | 2 weeks | Alternative to HTML-only export. |
| P3 | **Animation/interaction system** — Scroll triggers, hover animations, click handlers | 3 weeks | Requires JS in publish output + new store slice. |

---

**Total estimated effort to production-ready e-commerce builder:** ~10-12 weeks for one engineer, ~6-7 weeks for two engineers working in parallel (Phase 1-2 can overlap with Phase 3 component work).

**Recommended team split:**
- **Engineer A:** Performance fixes (Phase 1) → file splits (Phase 2) → tests (Phase 4)
- **Engineer B:** Components + default styles (Phase 3) → templates → asset upload