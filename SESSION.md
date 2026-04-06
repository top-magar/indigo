# Session Progress

**Project**: Indigo — Shopify-style visual page builder (Craft.js + Next.js 16)
**Branch**: main
**Last Updated**: 2026-04-06 16:25
**Phase**: Editor architecture cleanup + Figma-inspired UI polish
**Checkpoint**: a1290b7

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
- Clean working tree, no uncommitted changes
- 5 files changed in last commit: spacing-control, padding-control, hero, columns, image-with-text

## Blockers
- Pre-existing build error in skills/react-components/examples/gold-standard-card.tsx (not our code)
- 43 remaining inline var(--editor-*) refs (chrome tokens, structural — low priority)

## Resume Instructions
1. Run `npx tsc --noEmit 2>&1 | grep -v 'skills/' | grep -v 'commerce-ui/' | grep 'error TS'` to verify clean
2. Open editor in browser, test all panels: hero, product-grid, columns, image-with-text, divider
3. Verify spacing controls: toggle through all 3 link modes (all/axis/individual) for both padding and margin
4. Verify vertical align icons render correctly in columns and image-with-text blocks
5. Consider next improvements:
   - `Space` icon for gap controls
   - `Rows2/3/4` for row count controls
   - `StretchHorizontal/Vertical` for fill-container width/height
   - `FoldHorizontal/Vertical` for hug-content
   - Remaining 43 inline var(--editor-*) refs cleanup
