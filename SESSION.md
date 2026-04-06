# Editor v2 — Phase 2 Progress

**Branch**: main | **Checkpoint**: f8de292 | **Updated**: 2026-04-06 22:36

## Phase 1 (Architecture): 9/9 ✅ | Phase 2 (Production): 3/6

### P2-T1 ✅ Save/Publish + Page Load
- Dual format: v2 native JSON + Craft.js compat
- Autosave 3s, ⌘S, Save/Publish buttons, loading states

### P2-T2 ✅ Drag-and-drop reordering
- Native HTML5 DnD, drop zones, MoveNode operations

### P2-T3 ✅ Port 8 e-commerce blocks (13 total now)
- Header, Footer, ProductGrid, FeaturedProduct, CollectionList, Newsletter, FAQ, Testimonials
- 16 files, 393 lines. Same pattern: .schema.ts + .tsx

### P2-T4 ⬜ Theme / Site Styles panel (NEXT)
- editor/theme-panel.tsx — fields for ThemeTokens (colors, fonts, spacing, maxWidth)
- Add theme to Zustand store (already has setTheme), wire themeToCssVars to canvas
- Add "Site Styles" to left panel switcher

### P2-T5 ⬜ Import v1 pages + grid overlay
### P2-T6 ⬜ Layers panel + context menu

## Resume
```
Resume editor v2 Phase 2. P2-T1/T2/T3 complete (save, DnD, 13 blocks).
Start P2-T4: theme/site styles panel. Read SESSION.md for context.
```
