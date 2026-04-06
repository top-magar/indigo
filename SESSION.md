# Editor v2 — Session Progress

**Project**: Indigo Editor v2 — From-scratch, schema-driven, plugin-ready architecture
**Branch**: main
**Last Updated**: 2026-04-06 22:08
**Checkpoint**: 6a3bfef
**Status**: MVP COMPLETE (T1-T5), T6 next

## Stats: 30 files, 1,688 lines

## Completed

### T1 — Core (6 files, 641 lines) `src/features/editor-v2/core/`
- `document.ts` — DocumentNode, tree CRUD, immutable updates
- `schema.ts` — defineBlock<T>(), 7 FieldDef types, InferProps, getDefaults/getContentFields/getFieldsByGroup
- `registry.ts` — register/unregister/get/list/listByCategory/validateProps
- `tokens.ts` — 3-tier hierarchy, SPACE scale, GRID constants, themeToCssVars
- `operations.ts` — 5 op types (add/delete/move/updateProps/reorder), applyOperation
- `serializer.ts` — toJSON/fromJSON + toCraftJSON/fromCraftJSON

### T2 — 5 Blocks (11 files, 327 lines) `src/features/editor-v2/blocks/`
- Each = .schema.ts + .tsx (pure render, inline props, no editor dependency)
- Hero (3 variants), Text, Image (5 aspect ratios), Button (3 variants × 3 sizes), Columns (container, 5 proportions)
- Circular ref fix: render components use inline prop interfaces, not schema imports

### T3 — Inspector (2 files, 215 lines) `src/features/editor-v2/editor/`
- `schema-fields.tsx` — SchemaField router + 7 field components
- `inspector.tsx` — reads schema, Content/Design tabs, grouped fields, presets

### T4 — Canvas + Wrappers (6 files, 231 lines)
- `wrappers/` — selection (44), layout (20), effects (25), visibility (16), animation (42)
- `editor/canvas.tsx` (84) — recursive tree render, wrapper pipeline

### T5 — Shell + Store (5 files, 278 lines)
- `store.ts` — Zustand: document, selection, viewport, zoom, undo/redo (50-level)
- `block-panel.tsx` — reads registry, click to add
- `toolbar.tsx` — undo/redo, viewport, zoom, gridlines
- `shell.tsx` — 3-column layout, keyboard shortcuts, theme vars
- `index.ts` — public API barrel

## Next: T6 — Plugin System
- `plugins/types.ts` — EditorPlugin + EditorAPI interfaces
- `plugins/loader.ts` — load/unload/validate plugins
- `plugins/built-in/` — undo, clipboard, shortcuts as plugins
- Proves the API: built-in features use same API as third-party

## Remaining
- T7: Collaboration foundation (adapter pattern, LocalAdapter)
- T8: Storefront renderer + Craft.js compat
- T9: Route integration + feature flag

## Architecture Notes
- No Craft.js dependency — own document model
- Blocks are pure render — shared by editor + storefront
- Schema = single source of truth — inspector auto-generated
- Operations are serializable — undo/redo + future CRDT
- Circular ref solved: schemas import renders, renders define own props

## Resume Command
```
Resume editor v2 build. T1-T5 (MVP) complete at src/features/editor-v2/.
30 files, 1,688 lines. Start T6: plugin system. Read SESSION.md for context.
```
