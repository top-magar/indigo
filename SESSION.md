# Editor v2 — Session Progress

**Project**: Indigo Editor v2 — From-scratch, schema-driven, plugin-ready architecture
**Branch**: main
**Last Updated**: 2026-04-06 21:53
**Checkpoint**: c18b9c4

## Status: T1-T2 Complete, T3 Next

### Completed: T1 — Core Document Model + Schema System
- 6 files, 641 lines at `src/features/editor-v2/core/`
- `document.ts` — DocumentNode type, tree CRUD, immutable updates, generateId
- `schema.ts` — defineBlock<T>() with InferProps, 7 FieldDef types, getDefaults/getContentFields/getFieldsByGroup
- `registry.ts` — register/unregister/get/list/listByCategory/validateProps
- `tokens.ts` — 3-tier hierarchy, SPACE scale, GRID constants, themeToCssVars
- `operations.ts` — 5 op types (add/delete/move/updateProps/reorder), applyOperation
- `serializer.ts` — toJSON/fromJSON + toCraftJSON/fromCraftJSON compat

### Completed: T2 — First 5 Blocks
- 11 files, 327 lines at `src/features/editor-v2/blocks/`
- Each block = .schema.ts + .tsx (pure render, inline props interface)
- Hero: 3 variants (full/split/minimal), heading/subheading/CTA, bg image support
- Text: rich text with alignment, fontSize, lineHeight, maxWidth
- Image: aspect ratio (auto/1:1/16:9/4:3/3:2), objectFit, borderRadius
- Button: 3 variants (solid/outline/ghost) × 3 sizes (sm/md/lg), fullWidth option
- Columns: container with children, proportions (equal/40-60/60-40/30-70/70-30)
- Fixed circular reference: render components use inline prop interfaces, not schema imports
- registerBuiltInBlocks() in blocks/index.ts

### Next: T3 — Auto-generated Inspector from Schema
- Read block schema → iterate fields → render appropriate field component per type
- Content/Design tab toggle (content: true fields vs rest)
- Layout presets section from schema.presets
- Field components: TextField, SliderField, ColorField, SegmentedControl, Toggle, ImagePicker

### Remaining Tasks
- T4: Editor canvas with composable wrappers
- T5: Editor shell + toolbar + block panel + Zustand store
- T6: Plugin system
- T7: Collaboration foundation
- T8: Storefront renderer + Craft.js compatibility
- T9: Route integration + feature flag

### Architecture Note
Circular reference fix: schemas import render components, but render components do NOT import schemas. Props interfaces are defined inline in each .tsx file. This breaks the cycle while keeping full type safety.

### Directory Structure
```
src/features/editor-v2/
├── core/           ✅ T1 (6 files, 641 lines)
├── blocks/         ✅ T2 (11 files, 327 lines)
├── editor/         ⬜ T3-T5
├── wrappers/       ⬜ T4
├── plugins/        ⬜ T6
├── collab/         ⬜ T7
└── renderer/       ⬜ T8
```

### Resume Command
```
Resume editor v2 build. T1 (core) and T2 (5 blocks) complete.
Start T3: auto-generated inspector from schema. Read SESSION.md for full context.
```
