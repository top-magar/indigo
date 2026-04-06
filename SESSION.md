# Editor v2 — Phase 2 Progress

**Branch**: main
**Last Updated**: 2026-04-06 22:30
**Checkpoint**: 53f76ac

## Phase 1 (Architecture): 9/9 COMPLETE ✅ — 42 files, 2,071 lines
## Phase 2 (Production): 2/6 complete

### P2-T1 ✅ Save/Publish + Page Load
- Store: tenantId, pageId, dirty, saving, lastSaved, theme
- loadFromCraftJSON() for v1 import, getSerializedJSON() + getCraftJSON() dual format
- Shell wires saveDraftAction/publishAction/saveThemeAction from v1 backend
- Autosave 3s debounce, ⌘S manual save, Save/Publish buttons with loading state
- Route passes tenantId/pageId/craftJson to v2 shell

### P2-T2 ✅ Drag-and-drop reordering
- Each node draggable, drop zones between blocks (2px → 4px blue line)
- Dragged node at 40% opacity, drop creates MoveNode operation
- Works for sibling reorder + dropping into containers (Columns)

### P2-T3 ⬜ Port 8 e-commerce blocks (NEXT)
Blocks to create (each = .schema.ts + .tsx):
- Header (logo, nav links, sticky)
- Footer (link columns, copyright, social)
- ProductGrid (product cards grid, mock data)
- FeaturedProduct (image + title + price + CTA)
- CollectionList (collection cards grid)
- Newsletter (heading + email input + submit)
- FAQ (accordion items)
- Testimonials (quote cards grid)

### P2-T4 ⬜ Theme / Site Styles panel
### P2-T5 ⬜ Import v1 pages + grid overlay
### P2-T6 ⬜ Layers panel + context menu

## Resume Command
```
Resume editor v2 Phase 2. P2-T1 (save/publish) and P2-T2 (drag-and-drop) complete.
Start P2-T3: port 8 e-commerce blocks. Each = .schema.ts + .tsx pure render.
Pattern: see blocks/hero.schema.ts + blocks/hero.tsx. Read SESSION.md for context.
```
