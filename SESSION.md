# Editor v2 — COMPLETE ✅

**Project**: Indigo Editor v2 — From-scratch, schema-driven, plugin-ready architecture
**Branch**: main
**Last Updated**: 2026-04-06 22:12
**Checkpoint**: 3e423a7

## Final Stats: 42 files, 2,071 lines — ALL 9 TASKS COMPLETE

| Layer | Files | Lines | Purpose |
|-------|-------|-------|---------|
| core/ | 7 | 641 | Document model, schema, registry, tokens, operations, serializer |
| blocks/ | 11 | 327 | 5 blocks (Hero, Text, Image, Button, Columns) |
| editor/ | 7 | 575 | Inspector, canvas, shell, store, toolbar, block panel, schema fields |
| wrappers/ | 5 | 147 | Selection, layout, effects, visibility, animation |
| plugins/ | 5 | 236 | Plugin types, loader, clipboard, shortcuts |
| collab/ | 3 | 60 | Adapter interface, LocalAdapter |
| renderer/ | 2 | 65 | Storefront RenderTree |
| root | 2 | 20 | index.ts, feature-flag.ts |

## How to Activate
```bash
NEXT_PUBLIC_EDITOR_VERSION=v2 npm run dev
```

## Architecture
- No Craft.js — own document model, own tree renderer
- Schema = single source of truth — inspector auto-generated
- Operations are serializable — undo/redo + future CRDT
- Plugin system — built-in features use same API as third-party
- Collab is an adapter swap — LocalAdapter now, YjsAdapter later
- Blocks are pure render — shared by editor + storefront
- Feature flag — v1 default, v2 opt-in, both coexist

## v1 vs v2 Comparison
| Metric | v1 | v2 |
|--------|----|----|
| Total lines | ~10,000 | 2,071 |
| Files | 97 | 42 |
| Lines per block (avg) | 114 | 65 |
| Settings code per block | ~50 lines hand-written | 0 (auto-generated) |
| render-node concerns | 13 in 1 file | 5 separate wrappers |
| Plugin system | none | full API |
| Collab ready | no | adapter pattern |
| Craft.js dependency | runtime | compat serializer only |
