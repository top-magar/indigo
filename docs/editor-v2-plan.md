# Editor V2 — Architecture Plan

## Principle
V2 lives at `/storefront/v2` as a separate route. V1 remains untouched at `/storefront`.
V2 reuses: block types, block components, store (Zustand), server actions, auth.
V2 replaces: visual-editor.tsx, inline-preview, settings panel, layers panel, header.

## What V2 Fixes (from competitive analysis + visual audit)

### Architecture
1. **Iframe-first preview for ALL viewports** — no more CSS media query mismatch
2. **Resizable panels** — drag to resize layers/settings panels (like Webflow/Figma)
3. **Floating settings panel** — detachable, movable (like Figma properties panel)
4. **Canvas zoom/pan** — scroll to zoom, space+drag to pan (like Figma/Framer)

### Features
5. **AI generation built-in** — prominent in empty state + command palette
6. **Version history** — save snapshots, restore previous versions
7. **Multi-select** — shift+click to select multiple blocks, bulk operations
8. **Quick actions toolbar** — floating toolbar follows selection (like Notion)

## File Structure
```
src/app/(editor)/storefront/v2/
  page.tsx              — server component (auth + data fetch, reuse from v1)
  editor.tsx            — client component (main layout)
  actions.ts            — symlink or re-export from ../actions.ts

src/features/editor-v2/
  store.ts              — re-export v1 store (same Zustand store)
  components/
    canvas.tsx          — iframe preview with zoom/pan
    panel-layers.tsx    — resizable layers panel
    panel-settings.tsx  — resizable settings panel
    toolbar.tsx         — top toolbar (viewport, zoom, save, publish)
    toolbar-floating.tsx — selection-following quick actions
    empty-state.tsx     — AI generation prompt when no blocks
    version-history.tsx — snapshot list + restore
  hooks/
    use-canvas.ts       — zoom/pan state + keyboard shortcuts
    use-panels.ts       — panel resize + collapse state
    use-multi-select.ts — shift+click multi-selection
```

## Implementation Batches

### Batch 1: Shell + Canvas (parallel-safe: all new files)
- v2/page.tsx — copy auth logic from v1
- v2/editor.tsx — 3-panel layout with resizable panels
- canvas.tsx — iframe preview with zoom/pan
- toolbar.tsx — top bar

### Batch 2: Panels (parallel-safe: all new files)
- panel-layers.tsx — simplified layers (reuse layer-item from v1)
- panel-settings.tsx — settings with field system (reuse fields from v1)
- toolbar-floating.tsx — floating selection toolbar

### Batch 3: Features (parallel-safe: all new files)
- empty-state.tsx — AI generation CTA
- version-history.tsx — snapshot save/restore
- use-multi-select.ts — multi-selection hook
