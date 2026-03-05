# Editor V2 — Migration Plan

## Analysis

### Evidence: Duplicate/Dead Components Found

| Component | Status | Evidence |
|-----------|--------|----------|
| 8 regular fields (text, textarea, number, select, boolean, color, image, array) | **DEAD** | Only imported by auto-field.tsx, which is never imported outside fields/ |
| auto-field.tsx (177 lines) | **DEAD** | Only imported by object-field.tsx and array-field.tsx (internal) |
| object-field.tsx | **DEAD** | Only imported by auto-field.tsx (circular dead chain) |
| array-field.tsx (163 lines) | **DEAD** | Only imported by auto-field.tsx |
| minimal-* fields (8 files) | **ALIVE** | Used by minimal-auto-field → settings-panel |
| layers-layout-modes.tsx (636 lines) | Oversized | 3 view modes, only TreeView used in layers-panel |
| layers-history.tsx (334 lines) | Alive | Used by layers-panel |
| layers-filter-menu.tsx (348 lines) | Alive | Used by layers-panel-toolbar |
| layers-context-actions.tsx (506 lines) | Alive | Used by layer-item |
| layers-panel-toolbar.tsx (331 lines) | Alive | Used by layers-panel |
| live-preview.tsx (156 lines) | Alive | iframe fallback mode |
| focus-preview.tsx (347 lines) | Alive | Single-block zoom |

### Architecture Decision: Puck-Inspired Config-Driven

Indigo already has `FieldConfig` discriminated union + `FieldSchema = Record<string, FieldConfig>`.
This maps directly to Puck's `fields: { title: { type: "text" } }` pattern.
The minimal field system already works as a single auto-router.

**Decision**: Keep the minimal field system as THE field system, delete the regular one entirely.
Rename `MinimalAutoField` → `AutoField`, `MinimalTextField` → `TextField`, etc.

### Consolidation Plan

**Phase 1: Delete dead regular field system (10 files, ~930 lines)**
- Delete: text-field, textarea-field, number-field, select-field, boolean-field,
  color-field, image-field, array-field, object-field, auto-field
- Rename: minimal-* → remove "minimal-" prefix
- Net: 25 field files → 15 field files

**Phase 2: Consolidate layers panel (8 → 4 files)**
- Merge layers-panel-toolbar INTO layers-panel (331 lines → inline)
- Merge layers-filter-menu INTO layers-panel (348 lines → inline)
- Merge layers-history INTO layers-panel (334 lines → inline)
- Keep: layers-panel, layer-item, layers-dnd-system, layers-context-actions
- Delete layers-layout-modes: inline TreeView into layers-panel, delete ListView/GridView if unused

**Phase 3: Store slices (1 file → 5 files)**
- store/blocks-slice.ts — block CRUD, move, duplicate
- store/selection-slice.ts — select, hover, multi-select
- store/history-slice.ts — undo, redo, mutateBlocks helpers
- store/clipboard-slice.ts — copy, paste, styles
- store/index.ts — compose slices, export useEditorStore

**Phase 4: Preview consolidation**
- Keep inline-preview as primary
- Keep live-preview as iframe fallback
- Merge focus-preview into inline-preview as a "focused" render mode

### Target File Tree

```
src/features/editor/
├── store/
│   ├── index.ts              (~50 lines — compose + export)
│   ├── blocks-slice.ts       (~350 lines)
│   ├── selection-slice.ts    (~100 lines)
│   ├── history-slice.ts      (~80 lines — mutateBlocks helpers)
│   ├── clipboard-slice.ts    (~80 lines)
│   └── ui-slice.ts           (~60 lines — viewport, zoom, mode)
├── components/
│   ├── editor-header.tsx      (keep)
│   ├── settings-panel.tsx     (keep)
│   ├── layers-panel.tsx       (absorb toolbar + filter + history)
│   ├── layer-item.tsx         (keep)
│   ├── layers-dnd-system.tsx  (keep)
│   ├── layers-context-actions.tsx (keep)
│   ├── inline-preview.tsx     (absorb focus-preview)
│   ├── live-preview.tsx       (keep — iframe mode)
│   ├── block-palette.tsx      (keep)
│   ├── preset-palette.tsx     (keep)
│   ├── command-palette.tsx    (keep)
│   ├── editable-block-wrapper.tsx (keep)
│   ├── global-styles-panel.tsx (keep)
│   ├── global-styles-injector.tsx (keep)
│   ├── seo-panel.tsx          (keep)
│   ├── save-button.tsx        (keep)
│   ├── animation-picker.tsx   (keep)
│   ├── resize-handles.tsx     (keep)
│   ├── smart-guides.tsx       (keep)
│   ├── keyboard-shortcuts-dialog.tsx (keep)
│   ├── save-preset-dialog.tsx (keep)
│   ├── start-fresh-dialog.tsx (keep)
│   ├── block-ghost-preview.tsx (keep)
│   ├── section-settings.tsx   (keep)
│   ├── block-presets-menu.tsx  (keep)
│   ├── animated-drop-indicator.tsx (keep)
│   └── inline-preview-error-boundary.tsx (keep)
├── fields/
│   ├── types.ts               (keep)
│   ├── components/
│   │   ├── auto-field.tsx     (renamed from minimal-auto-field)
│   │   ├── text-field.tsx     (renamed from minimal-text-field)
│   │   ├── textarea-field.tsx (renamed from minimal-textarea-field)
│   │   ├── number-field.tsx   (renamed from minimal-number-field)
│   │   ├── select-field.tsx   (renamed from minimal-select-field)
│   │   ├── boolean-field.tsx  (renamed from minimal-boolean-field)
│   │   ├── color-field.tsx    (renamed from minimal-color-field)
│   │   ├── image-field.tsx    (renamed from minimal-image-field)
│   │   ├── array-field.tsx    (renamed from minimal-array-field)
│   │   ├── richtext-field.tsx (keep)
│   │   ├── url-field.tsx      (keep)
│   │   ├── icon-field.tsx     (keep)
│   │   ├── product-field.tsx  (keep)
│   │   ├── collection-field.tsx (keep)
│   │   └── products-field.tsx (keep)
│   └── index.ts
├── hooks/                     (keep all 9)
├── ai/                        (keep — already trimmed)
├── autosave/                  (keep)
├── seo/                       (keep)
├── block-constants.ts         (keep)
├── clipboard.ts               (keep)
├── communication.ts           (keep)
├── guides.ts                  (keep)
├── presets.ts                 (keep)
├── types.ts                   (keep)
└── index.ts
```

### Projected Impact

| Metric | Before | After | Saved |
|--------|--------|-------|-------|
| Field files | 25 | 16 | 9 files (~930 lines) |
| Barrel exports | ~80 exports | ~20 exports | 60 dead exports removed |
| Total lines | 28,202 | 27,250 | ~950 lines |

### Migration Order (Revised After Evidence-Based Analysis)

1. ✅ **Phase 1: Dead field deletion** — 9 dead files deleted (regular field system)
2. ✅ **Phase 2: Field rename** — minimal-* → clean names, unified field system
3. ✅ **Phase 3: Barrel cleanup** — components/index.ts trimmed to 20 actual exports
4. ~~Phase 4: Layers consolidation~~ — **CANCELLED**: Evidence shows each file is
   300-1,080 lines with its own state. Merging would create a 4,442-line monster.
5. ~~Phase 5: Store slicing~~ — **CANCELLED**: 1,226 lines with mutateBlocks helpers
   is well-organized. Slicing adds cross-file complexity for no real benefit.
6. ~~Phase 6: Preview merge~~ — **CANCELLED**: focus-preview (347 lines) has distinct
   UI (viewport switcher, zoom, back button). Merging into 894-line inline-preview
   would create a 1,200+ line component.

### Key Lesson
The Anthropic Ch 8 technique (gather evidence first, then decide) prevented 3 bad
merges that would have made the codebase WORSE. The original plan assumed "fewer files
= better" but evidence showed the files are well-decomposed with clear boundaries.

Each phase: gather evidence → analyze in structured tags → execute → `npx tsc --noEmit`
