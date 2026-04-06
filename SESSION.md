# Session Progress

**Project**: Indigo — Shopify-style visual page builder (Craft.js + Next.js 16)
**Branch**: main
**Last Updated**: 2026-04-06 18:40
**Phase**: Editor architecture cleanup + Figma-inspired UI polish + Canvas interactions
**Checkpoint**: b643d4f

## What Works

### Architecture (earlier session)
- editor-shell.tsx decomposed: 368→185 lines (useEditorState hook, RightPanel, themeToVars)
- site-styles-panel.tsx decomposed: 417→267 lines (shared types/components)
- EditorContext: 9 components use useEditorContext(), tenantId drilling eliminated across 11 components
- Inline var(--editor-*) cleanup: 169→43 refs, conditional ternaries → cn() + Tailwind
- Theme CSS: 27→20 vars, 7 dead vars removed

### Bug fixes
- Build error: "use client" moved to line 1 in orders helpers
- Dead code: empty onNodesChange removed
- Canvas bleed: bg-background z-10 on all panels
- Right panel: white bg, overflow-y-auto, ribbon tab bg
- Border shorthand warning: longhand in render-node.tsx
- Canvas scroll: flex-1 + minHeight:0 on page div, overflow auto

### Features
- Device frames: mobile phone bezel with notch, tablet subtle bezel
- top-bar.tsx decomposed: AutosaveIndicator + PreviewDropdown extracted
- add-section-modal.tsx decomposed: BlockPreview + CategoryTab extracted

### Duplicate controls fix
- UniversalStyleControls skip prop: accepts ("style"|"spacing"|"visibility")[]
- 10 blocks fixed with skip=["style","spacing"]
- SettingsPanel hides SpacingControl when block has own padding props

### Icon-based controls (Figma-style)
- SegmentedControl: iconOnly mode with tooltip
- Alignment: AlignLeft/Center/Right (horizontal), AlignStartVertical/CenterVertical/EndVertical (vertical)
- Button style: RectangleHorizontal (Solid), SquareDashed (Outline)
- Position: PanelLeft/PanelRight
- Columns: Columns2/3/4
- Divider: Minus/MoreHorizontal/GripHorizontal
- Image ratio labels shortened: "Portrait (3:4)" → "3:4" etc.

### Figma-style density
- Inputs h-8→h-7, selects h-8→h-7, toggles h-7→h-6
- Color swatch 32→28px, labels 12→11px, mb-1→mb-0.5
- SliderField: 2-line→single-line (label|slider|number)
- SizeControl: stacked→inline prefix (W 487)
- Section headers: h-9→h-8, 11px font

### Spacing controls
- SpacingControl: box-model→compact icon-based, 3 link modes (all/axis/individual)
  - Padding: MoveVertical/MoveHorizontal, Margin: UnfoldVertical/UnfoldHorizontal
  - Individual mode: ArrowUpToLine/RightToLine/DownToLine/LeftToLine icons
- PaddingControl: shared across 10 blocks, same 3 link modes + ArrowToLine icons

## Current Position
- All icon improvements applied and committed
- Canvas overlay system with snap guides, spacing indicators, drop zones
- Full layers panel: inline rename, visibility/lock toggles, search/filter
- Contact/video iframe blur fix applied
- Clean working tree, no uncommitted changes

### Canvas overlay system (new)
- CanvasOverlay: SVG overlay renders snap guides, spacing lines, drop zones
- overlay-store.ts: lightweight pub/sub store for overlay state
- useNodeRects: queries all craft node DOM rects adjusted for zoom/scroll
- Snap guides during resize: blue dashed lines when edges align within 5px
- Drop zone indicators: blue line + circle on canvas during layer drag reorder
- Spacing indicators: Alt+hover shows red measurement lines with pixel labels between selected and hovered nodes

### Full layers panel (new)
- Inline rename: double-click name → input, Enter/blur commits, Escape cancels
- Visibility toggle: Eye/EyeOff icon, uses actions.setHidden(), hidden nodes at 40% opacity
- Lock toggle: Lock/Unlock icon, uses actions.setCustom(locked), persists in tree
- Search/filter: input below header, recursive filter by name, "No matching layers" empty state
- Icons persist when not hovered for hidden/locked nodes

## Blockers
- Pre-existing build error in skills/react-components/examples/gold-standard-card.tsx (not our code)
- 43 remaining inline var(--editor-*) refs (chrome tokens, structural — low priority)

## Resume Instructions
1. Run `npx tsc --noEmit 2>&1 | grep -v 'skills/' | grep -v 'commerce-ui/' | grep 'error TS'` to verify clean
2. Open editor in browser, test canvas overlay: resize a block near another to see snap guides
3. Select a block, hold Alt, hover another block — verify spacing measurement lines appear
4. Test layers panel: double-click to rename, click eye to hide, click lock to lock, type in search
5. Drag a layer in the tree — verify blue drop zone indicator appears on canvas
6. Test at different zoom levels (0.5x, 1x, 2x) — overlays should scale correctly
7. Consider next improvements:
   - Lock state preventing canvas selection in render-node
   - `Space` icon for gap controls
   - `Rows2/3/4` for row count controls
   - Remaining 43 inline var(--editor-*) refs cleanup
   - AI sub-agents (layout, theme, content, QA) returning typed patches
