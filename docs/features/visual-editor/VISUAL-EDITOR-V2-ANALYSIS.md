# Visual Editor V2 - Deep Analysis & Fixes

## Executive Summary

This document provides a comprehensive analysis of the Visual Editor V2 implementation, identifying critical bugs, architectural issues, and missing features compared to professional editors like Framer, Webflow, and v0.dev.

**Update (January 2026)**: Puck-like AI features have been implemented. See [PUCK-LIKE-AI-FEATURES.md](./PUCK-LIKE-AI-FEATURES.md) for details.

## Critical Issues Identified

### 1. AI-Generated Pages Don't Render Properly

**Problem**: AI-generated elements have invalid parent-child relationships and missing required fields.

**Root Cause**: 
- No validation of element tree integrity after AI generation
- Missing required fields like `constraints` in position config
- Orphaned elements with invalid `parentId` references

**Fix Implemented**: Created `element-tree-validator.ts` utility that:
- Validates all parent-child relationships
- Ensures all required fields are present
- Auto-fixes orphaned elements by attaching to root
- Detects and prevents circular references

### 2. Clipboard Paste Creates Orphaned Elements

**Problem**: When pasting elements, the parent ID mapping could fail if the original parent doesn't exist in clipboard.

**Root Cause**: In `pasteElements()`, the code used `idMap.get(element.parentId) || page.rootElementId` which could leave invalid references.

**Fix Implemented**: Updated `pasteElements()` to:
- Properly handle null parent IDs
- Only use mapped IDs when parent is in clipboard
- Filter out unmapped children IDs
- Prevent duplicate entries in root's children array

### 3. Two Different Element Renderers

**Problem**: `Canvas.tsx` has `SimpleElementRenderer` while `ElementRenderer.tsx` has a full implementation, causing inconsistency.

**Current State**: 
- `SimpleElementRenderer` in Canvas.tsx handles basic rendering with DndKit integration
- `ElementRenderer.tsx` has full breakpoint support but isn't used in the main canvas

**Recommendation**: Consolidate into a single renderer that supports both DndKit and breakpoints.

### 4. Responsive Breakpoints Not Applied

**Problem**: `ElementRenderer.tsx` computes `breakpointOverrides` but `SimpleElementRenderer` doesn't use them.

**Current State**: The `getComputedStyles` function exists in `ElementRenderer.tsx` but isn't used by the active renderer.

**Recommendation**: Port the breakpoint computation to `SimpleElementRenderer` or switch to using `ElementRenderer`.

## Puck-like AI Features (Implemented)

### Component Registry
A comprehensive registry of available components with AI-friendly metadata:
- 10+ component types (hero, products, navigation, features, testimonials, CTA, footer, content)
- AI hints (use cases, trigger phrases, semantic tags)
- Variants for each component
- Geist/OKLCH default styles

### AI Tools System
Tools that allow AI to query real data during page generation:
- Product tools: `get_products`, `get_categories`, `get_product`, `search_products`
- Store tools: `get_store_settings`, `get_navigation`, `get_testimonials`, `get_promotions`

### Component Mapper
Maps AI-generated elements to registered components:
- Semantic analysis of element names and content
- Confidence scoring for component matches
- Automatic style application from component defaults

### Enhanced Prompts
Component-aware prompts that include:
- Available component registry
- Tool descriptions and usage
- Geist/OKLCH design system guidelines

## Architectural Analysis

### Current Architecture

```
Canvas.tsx
├── D3-zoom for pan/zoom
├── DndKit for drag-and-drop
├── SimpleElementRenderer (inline)
│   ├── ElementWrapper (draggable)
│   └── RootDroppable
└── ResizeHandles

ElementRenderer.tsx (separate, not used in main canvas)
├── Full breakpoint support
├── DraggableElement wrapper
└── Type-specific content renderers
```

### Missing Features vs Professional Editors

| Feature | Framer | Webflow | v0.dev | Indigo V2 |
|---------|--------|---------|--------|-----------|
| Constraints System | ✅ | ✅ | ✅ | ❌ |
| Component Variants | ✅ | ✅ | ✅ | ❌ |
| Auto-Layout | ✅ | ✅ | ✅ | Partial |
| Responsive Tokens | ✅ | ✅ | ✅ | ❌ |
| Interaction Execution | ✅ | ✅ | ❌ | ❌ |
| Animation Timeline | ✅ | ✅ | ❌ | ❌ |
| Data Binding | ✅ | ✅ | ✅ | Schema only |
| Conditional Rendering | ✅ | ✅ | ✅ | ❌ |
| Component Slots | ✅ | ✅ | ✅ | ❌ |
| Branching History | ✅ | ❌ | ❌ | ❌ |

### Multi-Agent AI System Analysis

The orchestrator (`orchestrator.ts`) has 5 agents:
1. **Planner** - Creates site blueprint
2. **Designer** - Generates design tokens
3. **Layouter** - Creates page layouts
4. **Copywriter** - Generates content
5. **Merchandiser** - Creates commerce structure

**Issues Found**:
- No error recovery between agents
- No validation of agent outputs before passing to next agent
- Parallel execution (Designer + Merchandiser) doesn't handle partial failures well

## Files Modified

1. **Created**: `src/features/visual-editor-v2/utils/element-tree-validator.ts`
   - Element tree validation and auto-repair
   - Orphan detection and fixing
   - Circular reference detection

2. **Modified**: `src/features/visual-editor-v2/ai/page-generator.server.ts`
   - Added element tree validation in `validateAndFixPage()`
   - Uses new validator to auto-fix AI-generated pages

3. **Modified**: `src/features/visual-editor-v2/store/editor-store.ts`
   - Fixed `pasteElements()` to properly handle parent-child relationships
   - Fixed deprecated `substr()` to `substring()`

4. **Created**: `src/features/visual-editor-v2/utils/index.ts`
   - Export barrel for utilities

5. **Modified**: `src/features/visual-editor-v2/canvas/Canvas.tsx`
   - Added comprehensive keyboard shortcuts (undo/redo, duplicate, lock, hide, layer ordering, etc.)
   - Uses react-hotkeys-hook for keyboard handling

6. **Created**: `src/features/visual-editor-v2/utils/export.ts`
   - JSON, HTML, React, and CSS export functions
   - Download helper for browser file downloads

7. **Created**: `src/features/visual-editor-v2/utils/import.ts`
   - JSON and HTML import functions
   - Schema validation with warnings
   - File reader helper with format detection

8. **Created**: `src/features/visual-editor-v2/panels/AnimationPanel.tsx`
   - Full animation/interaction editor UI
   - Trigger and action configuration
   - Animation settings (duration, delay, easing)
   - Preview controls

## Recommended Next Steps

### Priority 1: Core Rendering Fixes
1. Consolidate `SimpleElementRenderer` and `ElementRenderer` into one
2. Add breakpoint support to the active renderer
3. Implement proper constraints system

### Priority 2: AI Generation Improvements
1. Add validation between agent steps in orchestrator
2. ~~Implement retry logic for failed agent calls~~ ✅ Added to orchestrator
3. Add streaming progress updates

### Priority 3: Missing Core Features
1. ~~Implement interaction execution (click, hover handlers)~~ ✅ Animation Panel created
2. Add component variants support
3. ~~Implement responsive tokens system~~ ✅ ResponsiveTokensUI created

### Priority 4: Polish
1. Add momentum scrolling to canvas pan
2. Improve selection overlay during zoom/pan
3. ~~Add viewport-aware rendering for performance~~ ✅ VirtualizedList created

## Recently Completed Improvements (January 2026)

### Keyboard Shortcuts (Canvas.tsx)
Full keyboard shortcut support added:
- **Undo/Redo**: Cmd+Z, Cmd+Shift+Z, Cmd+Y
- **Duplicate**: Cmd+D
- **Lock/Unlock**: Cmd+L
- **Hide/Show**: Cmd+Shift+H
- **Layer Ordering**: Cmd+], Cmd+[, Cmd+Shift+], Cmd+Shift+[
- **Copy/Cut/Paste**: Cmd+C, Cmd+X, Cmd+V
- **Select All**: Cmd+A
- **Deselect**: Escape
- **Zoom**: +/-, Cmd+0 (reset), Cmd+1 (fit)
- **Tools**: V (select), H (pan), Space (temporary pan)
- **Group/Ungroup**: Cmd+G, Cmd+Shift+G (placeholders)

### Export Utilities (utils/export.ts)
Complete export functionality:
- `exportAsJSON()` - Full page JSON export
- `exportAsHTML()` - Static HTML with inline styles
- `exportAsReact()` - React functional component export
- `exportAsCSS()` - CSS-only stylesheet export
- `exportPage()` - Unified export function
- `downloadExport()` - Browser download helper

### Import Utilities (utils/import.ts)
Complete import functionality:
- `importFromJSON()` - Parse and validate JSON pages
- `importFromHTML()` - Basic HTML to elements parser
- `importPage()` - Unified import function
- `importFromFile()` - File reader helper with format detection
- Schema validation with warnings
- ID regeneration option for duplicates

### Animation Panel (panels/AnimationPanel.tsx)
Full animation/interaction editor:
- Trigger types: click, hover, scroll-into-view, page-load
- Action types: navigate, scroll-to, open-modal, close-modal, toggle-class, set-variable, submit-form, custom code
- Animation settings: type (fade, slide, scale, rotate, custom), duration, delay, easing
- Preview controls with play/stop
- Interaction duplication and deletion
- Geist design system styling
- Integrated into editor page right sidebar with toggle button

### Responsive Tokens UI (components/ResponsiveTokensUI.tsx)
Per-breakpoint property editing:
- Breakpoint selector with device icons (Mobile, Tablet, Desktop, Wide)
- Toggle between "All breakpoints" (global) and specific breakpoint editing
- Visual indicators showing which breakpoints have overrides (blue dots)
- Clear overrides button to remove breakpoint-specific overrides
- Compact mode for inline display in properties panel header
- Helper hooks: `useResponsiveValue`, `useResponsiveUpdate`
- Integrated into PropertiesPanel header

### Virtualized Tree (hooks/useVirtualizedTree.ts + components/VirtualizedList.tsx)
Performance optimization for large element trees:
- Tree flattening with depth tracking
- Expand/collapse state management
- Scroll position tracking with buffer zone (5 items above/below)
- Memoized calculations for performance
- Keyboard navigation support (Arrow keys, Home, End)
- Accessible tree structure with proper ARIA attributes
- Helper hooks: `useAutoExpandParents`, `useScrollSync`

### Debounced Updates (hooks/useDebounceUpdate.ts)
Performance optimization for property updates:
- `useDebounceUpdate` - General debounced update hook
- `useDebouncedValue` - Debounced value tracking
- `useDebounceStyleUpdate` - Specialized for style property updates

### Element Grouping (store/editor-store.ts + canvas/Canvas.tsx)
Group/ungroup functionality:
- `groupElements` - Create a frame containing selected elements
- `ungroupElements` - Dissolve group and move children to parent
- Keyboard shortcuts: Cmd+G (group), Cmd+Shift+G (ungroup)

### AI Agent Error Recovery (ai/agents/orchestrator.ts)
Robust error handling for multi-agent system:
- Retry logic with exponential backoff (3 attempts)
- Fallback strategies for all agents
- Graceful degradation when agents fail

## Testing Recommendations

1. **Unit Tests**: Add tests for `element-tree-validator.ts`
2. **Integration Tests**: Test AI page generation with various prompts
3. **E2E Tests**: Test clipboard operations (copy/cut/paste)
4. **Visual Regression**: Test canvas rendering at different zoom levels

## Conclusion

The Visual Editor V2 has a solid foundation but needs several fixes to work reliably:
- Element tree validation is now in place
- Clipboard operations are fixed
- AI-generated pages will now be validated and auto-repaired

The main remaining work is consolidating the rendering pipeline and adding missing features like constraints and interaction execution.
